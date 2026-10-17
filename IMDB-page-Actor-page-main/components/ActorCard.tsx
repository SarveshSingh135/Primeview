type Actor = {
  name: string
  bio: string
}

export default function ActorCard({ actor }: { actor: Actor }) {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-xl">
      <h2 className="text-xl font-bold">{actor.name}</h2>
      <p className="text-gray-400">{actor.bio}</p>
    </div>
  )
}