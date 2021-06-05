import { UATStates } from '../types'

export const GITHUB_PR_APPROVED_STATE = 'APPROVED'
export const GITHUB_PR_COMMENTED_STATE = 'COMMENTED'
export const GITHUB_PR_CHANGES_REQUESTED_STATE = 'CHANGES_REQUESTED'

export const UAT_APPROVED_STATE: UATStates = 'UAT_APPROVED'
export const UAT_NOT_REQUIRED_STATE: UATStates = 'UAT_NOT_REQUIRED'
export const UAT_CHANGES_REQUESTED_STATE: UATStates = 'UAT_CHANGES_REQUESTED'

export const DEFAULT_TEAM_REVIEWER_COUNT = 2
export const DEFAULT_KEY_REVIEWER_COUNT = 1
export const DEFAULT_UAT_SLOT = true

export const ICON_BLANK_SQUARE = '⬜'
export const ICON_BLANK_CIRCLE = '⚪'
export const ICON_APPROVED = '✅'
export const ICON_CHANGES = '❗'
export const ICON_COMMENT = '💬'
export const ICON_KEY_REVIEWER_APPROVED = '✨'
export const ICON_KEY_REVIEWER_CHANGES = '‼️'
export const ICON_KEY_REVIEWER_COMMENT = '🗨️'
export const ICON_UAT_APPROVED = '🎨'
export const ICON_UAT_NOT_REQUIRED = '⚪'
export const ICON_UAT_CHANGES = '🖌️'
export const ICON_WARNING = '⚠️'
export const ICON_TIME_SENSITIVE = '⏲️'
