import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Avatar with initials fallback, on shadcn's Avatar primitive. */
export function UserAvatar({
  name,
  src,
  size = 'default',
  className,
}: {
  name: string
  src?: string
  size?: 'default' | 'sm' | 'lg'
  className?: string
}) {
  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="bg-elevated font-medium">{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
