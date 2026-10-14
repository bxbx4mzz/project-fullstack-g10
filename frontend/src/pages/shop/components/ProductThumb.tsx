import { useState } from 'react'
import { resolveImageUrl } from '../../../lib/api'
import { isImageUrl } from './store'

type ProductThumbProps = {
  icon: string
  className?: string
  style?: React.CSSProperties
}

export function ProductThumb({ icon, className = 'fx-product-thumb', style }: ProductThumbProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (isImageUrl(icon) && failedSrc !== icon) {
    return (
      <div className={className} style={{ ...style, padding: 0, overflow: 'hidden' }}>
        <img
          src={resolveImageUrl(icon)}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setFailedSrc(icon)}
        />
      </div>
    )
  }

  return (
    <div className={className} style={style}>
      {isImageUrl(icon) ? '👕' : icon}
    </div>
  )
}
