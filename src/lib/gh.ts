import { Octokit } from 'octokit'
import { github } from '../../config.json'
import { PullRequest } from '../types'

interface FetchProps {
  owner?: string
  repo?: string
  labels?: string[]
}

export const fetchPRs = async ({
  owner,
  repo,
  labels,
}: FetchProps = {}): Promise<PullRequest[]> => {
  const octokit = process.env.GITHUB_TOKEN
    ? new Octokit({ auth: process.env.GITHUB_TOKEN })
    : undefined

  if (!octokit) {
    throw new Error('Octokit is uninitialized')
  }

  if (!(owner ?? github?.target_owner) || !(repo ?? github?.target_repo)) {
    throw new Error(
      'If not provided as arguments, the GitHub owner and repo name must be defined in `config.json`'
    )
  }

  const {
    repository: {
      pullRequests: { nodes },
    },
    // @ts-ignore
  } = await octokit.graphql(
    `
      query pullRequests($owner: String!, $repo: String!, $num: Int = 50, $labels: [String!]) {
        repository(owner: $owner, name: $repo) {
          pullRequests(labels: $labels, first: $num, states: OPEN) {
            nodes {
              author {
                ... on User {
                  login
                }
              }
              createdAt
              isDraft
              labels(first: $num) {
                nodes {
                  name
                }
              }
              number
              reviews(first: $num) {
                nodes {
                  state
                  author {
                    ... on User {
                      login
                    }
                  }
                }
              }
              pullRequestReadyTime: timelineItems(last: 1, itemTypes: READY_FOR_REVIEW_EVENT) {
                nodes {
                  ... on ReadyForReviewEvent {
                    createdAt
                  }
                }
              }
              pullRequestReopenTime: timelineItems(last:1, itemTypes: REOPENED_EVENT) {
                nodes {
                  ... on ReopenedEvent {
                    createdAt
                  }
                }
              }
              title
              url
            }
          }
        }
      }
    `,
    {
      owner: owner ?? github.target_owner,
      repo: repo ?? github.target_repo,
      labels,
    }
  )

  return nodes
}
