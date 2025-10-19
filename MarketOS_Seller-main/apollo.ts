import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
const url = import.meta.env.VITE_APPSYNC_URL as string
const key = import.meta.env.VITE_APPSYNC_KEY as string
const httpLink = new HttpLink({ uri: url, headers: { 'x-api-key': key } })
const wsLink = new GraphQLWsLink(createClient({ url: url.replace('https','wss'), connectionParams:{ headers:{ 'x-api-key': key }}}))
const link = split(({query}) => {
  const def = getMainDefinition(query)
  return def.kind === 'OperationDefinition' && def.operation === 'subscription'
}, wsLink, httpLink)
export const apollo = new ApolloClient({ link, cache: new InMemoryCache() })
