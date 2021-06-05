export type UATStates =
  | 'UAT_APPROVED'
  | 'UAT_NOT_REQUIRED'
  | 'UAT_CHANGES_REQUESTED'

export type PullRequest = {
  author: {
    login: string
  }
  createdAt: string
  isDraft: boolean
  labels: {
    nodes: Array<{
      name: string
    }>
  }
  number: number
  reviews: {
    nodes: Array<{
      state: string
      author: {
        login
      }
    }>
  }
  pullRequestReadyTime: {
    nodes: Array<{
      createdAt: string
    }>
  }
  pullRequestReopenTime: {
    nodes: Array<{
      createdAt: string
    }>
  }
  title: string
  url: string
}
