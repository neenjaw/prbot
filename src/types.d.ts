export type PullRequest = {
  author: {
    login: string
  }
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
  title: string
  url: string
}
