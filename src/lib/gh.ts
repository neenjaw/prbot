import { graphql } from '@octokit/graphql'
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
  if (!(owner ?? github?.target_owner) || !(repo ?? github?.target_repo)) {
    throw new Error(
      'If not provided as arguments, the GitHub owner and repo name must be defined in `config.json`'
    )
  }

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: process.env.GITHUB_TOKEN,
    },
  })

  const {
    repository: {
      pullRequests: { nodes },
    },
  } = await graphqlWithAuth(
    `
      query pullRequests(
        $owner: String!
        $repo: String!
        $num: Int = 50
        $labels: [String!]
      ) {
        repository(owner: $owner, name: $repo) {
          pullRequests(labels: $labels, first: $num, states: OPEN) {
            nodes {
              author {
                ... on User {
                  login
                }
              }
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
