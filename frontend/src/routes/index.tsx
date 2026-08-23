import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://api.github.com/repos/TanStack/router').then((res) =>
        res.json(),
      ),
  })

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <div className="mt-4 p-4 border rounded">
        <h4 className="font-bold">React Query Example:</h4>
        {isPending ? (
          'Loading...'
        ) : error ? (
          'An error has occurred: ' + error.message
        ) : (
          <div>
            <h1>{data.name}</h1>
            <p>{data.description}</p>
            <strong>👀 {data.subscribers_count}</strong>{' '}
            <strong>✨ {data.stargazers_count}</strong>{' '}
            <strong>🍴 {data.forks_count}</strong>
          </div>
        )}
      </div>
    </div>
  )
}
