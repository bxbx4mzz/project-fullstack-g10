import { resolveImageUrl } from '../../../lib/api'

type ProductThumbProps = {
  icon: string
  className?: string
  style?: React.CSSProperties
}

function looksLikeImage(icon: string): boolean {
  return /^(https?:\/\/|data:image|\/uploads\/)/.test(icon)
}

export function ProductThumb({ icon, className = 'fx-product-thumb', style }: ProductThumbProps) {
  if (looksLikeImage(icon)) {
    return (
      <div className={className} style={{ ...style, padding: 0, overflow: 'hidden' }}>
        <img src={resolveImageUrl(icon)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }

  return (
    <div className={className} style={style}>
      {icon}
    </div>
  )
}
