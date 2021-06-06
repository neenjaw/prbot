import { icons, pull_request as pullRequestConfig } from '../../config.json'
import { IconList, PullRequest, Review, UATStates } from '../types'
import {
  GITHUB_PR_APPROVED_STATE,
  GITHUB_PR_COMMENTED_STATE,
  GITHUB_PR_CHANGES_REQUESTED_STATE,
  UAT_APPROVED_STATE,
  UAT_NOT_REQUIRED_STATE,
  UAT_CHANGES_REQUESTED_STATE,
  DEFAULT_TEAM_REVIEWER_COUNT,
  DEFAULT_KEY_REVIEWER_COUNT,
  DEFAULT_UAT_SLOT,
  ICON_BLANK_SQUARE,
  ICON_BLANK_CIRCLE,
  ICON_APPROVED,
  ICON_CHANGES,
  ICON_COMMENT,
  ICON_KEY_REVIEWER_APPROVED,
  ICON_KEY_REVIEWER_CHANGES,
  ICON_KEY_REVIEWER_COMMENT,
  ICON_UAT_APPROVED,
  ICON_UAT_NOT_REQUIRED,
  ICON_UAT_CHANGES,
} from './constants'

export const formatPrsForChannel = (
  prs: PullRequest[],
  filterDraftPr: boolean = false
): string => {
  if (filterDraftPr) {
    prs = prs.filter((pr) => !pr.isDraft)
  }
  return prs.map(formatPrForChannel).join('\n')
}

const formatPrForChannel = (pr: PullRequest): string => {
  const {
    countTeamCommented,
    countTeamChangesRequested,
    countTeamApproved,
    countKeyCommented,
    countKeyChangesRequested,
    countKeyApproved,
    uatState,
  } = calculateStats(pr)

  const teamReviewerSlotsToAssign =
    pullRequestConfig?.team_reviewer_slots ?? DEFAULT_TEAM_REVIEWER_COUNT
  const keyReviewerSlotsToAssign =
    pullRequestConfig?.key_reviewer_slots ?? DEFAULT_KEY_REVIEWER_COUNT
  const uatSlotToAssign = pullRequestConfig?.uat_slot ?? DEFAULT_UAT_SLOT

  const teamReviews = createTeamReviews(
    teamReviewerSlotsToAssign,
    countTeamCommented,
    countTeamChangesRequested,
    countTeamApproved
  )

  const keyReviews = createKeyReviews(
    keyReviewerSlotsToAssign,
    countKeyCommented,
    countKeyChangesRequested,
    countKeyApproved
  )

  const uatReview = createUatReview(uatState)

  const reviews = [
    ...teamReviews,
    ...keyReviews,
    ...(uatSlotToAssign ? [uatReview] : []),
  ].join(' ')

  const prTime = formatPullRequestDateTime(pr)

  return `${reviews} <${pr.url}|PR #${pr.number}> (${prTime}) ${pr.title}`
}

const calculateStats = (pr: PullRequest) => {
  const reviewsByReviewer = getLatestReviewByReviewer(
    pr.reviews.nodes,
    pr.author.login
  )
  const { reviewsByKeyReviewer, reviewsByTeamReviewer } =
    chunkReviewsByKeyReviewer(
      reviewsByReviewer,
      pullRequestConfig.key_reviewers ?? []
    )

  const [countTeamCommented, countTeamChangesRequested, countTeamApproved] = [
    GITHUB_PR_COMMENTED_STATE,
    GITHUB_PR_CHANGES_REQUESTED_STATE,
    GITHUB_PR_APPROVED_STATE,
  ].map((state) => countReviews(reviewsByTeamReviewer, state))

  const [countKeyCommented, countKeyChangesRequested, countKeyApproved] = [
    GITHUB_PR_COMMENTED_STATE,
    GITHUB_PR_CHANGES_REQUESTED_STATE,
    GITHUB_PR_APPROVED_STATE,
  ].map((state) => countReviews(reviewsByKeyReviewer, state))

  const uatState = getUatState(pr)

  return {
    countTeamCommented,
    countTeamChangesRequested,
    countTeamApproved,
    countKeyCommented,
    countKeyChangesRequested,
    countKeyApproved,
    uatState,
  }
}

const getLatestReviewByReviewer = (reviews: Review[], author: string) => {
  return reviews.reduce((memo, { state, author: { login: reviewer } }) => {
    // Author can't approve their own PR
    if (reviewer === author) {
      return memo
    }

    // A later comment shouldn't overwrite changes requested or approved state
    if (
      memo[reviewer] &&
      state === GITHUB_PR_COMMENTED_STATE &&
      memo[reviewer] !== GITHUB_PR_COMMENTED_STATE
    ) {
      return memo
    }

    memo[reviewer] = state
    return memo
  }, {} as Record<string, string>)
}

const chunkReviewsByKeyReviewer = (
  reviews: Record<string, string>,
  keyReviewers: string[]
) => {
  const reviewsByTeamReviewer = []
  const reviewsByKeyReviewer = []

  for (const [reviewer, reviewState] of Object.entries(reviews)) {
    if (keyReviewers.includes(reviewer)) {
      reviewsByKeyReviewer.push(reviewState)
    } else {
      reviewsByTeamReviewer.push(reviewState)
    }
  }

  return {
    reviewsByTeamReviewer,
    reviewsByKeyReviewer,
  }
}

const countReviews = (reviews: string[], state: string) =>
  reviews.reduce((count, review) => {
    if (review === state) {
      return count + 1
    }
    return count
  }, 0)

const getUatState = (pr: PullRequest) => {
  if (
    !pullRequestConfig?.labels?.UAT_approved ||
    !pullRequestConfig?.labels?.UAT_changes ||
    !pullRequestConfig?.labels?.UAT_not_required
  ) {
    console.warn(
      'Unable to perform fine grained UAT state without config.pull_request.{UAT_approved, UAT_changes, UAT_not_required} set'
    )
    return UAT_NOT_REQUIRED_STATE
  }

  return pr.labels.nodes.reduce((state, label) => {
    if (state === UAT_CHANGES_REQUESTED_STATE) {
      return UAT_CHANGES_REQUESTED_STATE
    }

    if (label.name.indexOf(pullRequestConfig.labels.UAT_approved) !== -1) {
      return UAT_APPROVED_STATE
    }

    if (label.name.indexOf(pullRequestConfig.labels.UAT_changes) !== -1) {
      return UAT_CHANGES_REQUESTED_STATE
    }

    return state
  }, UAT_NOT_REQUIRED_STATE)
}

const formatPullRequestDateTime = (pr: PullRequest): string => {
  const times = [
    ['created', pr.createdAt],
    ['readied', pr.pullRequestReadyTime.nodes?.[0]?.createdAt],
    ['reopened', pr.pullRequestReopenTime.nodes?.[0]?.createdAt],
  ]

  const [timeType, time] = times.reduce(function (prev, current) {
    const [, prevTime] = prev
    const [, currentTime] = current

    if (!currentTime) {
      return prev
    }

    return prevTime > currentTime ? prev : current
  })

  const timeTypeDisplay =
    timeType === 'created'
      ? 'Created'
      : timeType === 'readied'
      ? 'Readied'
      : 'Reopened'

  const date = new Date(time)
  const unixTime = Math.round(date.getTime() / 1000)

  return `<!date^${unixTime}^${timeTypeDisplay}: {date_pretty}|${date.toUTCString()}>`
}

const createTeamReviews = (
  slotsToAssign: number,
  countCommented: number,
  countChangesRequested: number,
  countApproved: number
) => {
  return createReviews(
    slotsToAssign,
    countCommented,
    countChangesRequested,
    countApproved,
    {
      iconComment: icons?.comment ?? ICON_COMMENT,
      iconChanges: icons?.changes ?? ICON_CHANGES,
      iconApproved: icons?.approved ?? ICON_APPROVED,
      iconBlank: icons?.blank_square ?? ICON_BLANK_SQUARE,
    }
  )
}

const createKeyReviews = (
  slotsToAssign: number,
  countCommented: number,
  countChangesRequested: number,
  countApproved: number
) => {
  return createReviews(
    slotsToAssign,
    countCommented,
    countChangesRequested,
    countApproved,
    {
      iconComment: icons?.key_reviewer_comment ?? ICON_KEY_REVIEWER_COMMENT,
      iconChanges: icons?.key_reviewer_changes ?? ICON_KEY_REVIEWER_CHANGES,
      iconApproved: icons?.key_reviewer_approved ?? ICON_KEY_REVIEWER_APPROVED,
      iconBlank: icons?.blank_circle ?? ICON_BLANK_CIRCLE,
    }
  )
}

const createReviews = (
  slotsToAssign: number,
  countCommented: number,
  countChangesRequested: number,
  countApproved: number,
  { iconComment, iconChanges, iconApproved, iconBlank }: IconList
) => {
  const slots = []
  slots.push(
    ...new Array(Math.min(countApproved, slotsToAssign)).fill(iconApproved),
    ...new Array(countChangesRequested).fill(iconChanges)
  )

  const slotsRemaining =
    slotsToAssign - slots.length < 0 ? 0 : slotsToAssign - slots.length
  const commentSlotCount = Math.min(slotsRemaining, countCommented)
  slots.push(...new Array(commentSlotCount).fill(iconComment))

  const blankSlotCount = slotsRemaining - slots.length
  slots.push(...new Array(blankSlotCount).fill(iconBlank))

  return slots
}

const createUatReview = (uatState: UATStates) => {
  if (uatState === UAT_APPROVED_STATE) {
    return icons?.UAT_approved ?? ICON_UAT_APPROVED
  } else if (uatState === UAT_CHANGES_REQUESTED_STATE) {
    return icons?.UAT_changes ?? ICON_UAT_CHANGES
  } else {
    return icons?.UAT_not_required ?? ICON_UAT_NOT_REQUIRED
  }
}
