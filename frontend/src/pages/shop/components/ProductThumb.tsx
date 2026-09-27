type ProductThumbProps = {
  icon: string
  className?: string
  style?: React.CSSProperties
}

function looksLikeImage(icon: string): boolean {
  return icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:image')
}

/** Renders a product's `icon` field as a real <img> when it's a URL/data URI, or as emoji text otherwise. */
export function ProductThumb({ icon, className = 'fx-product-thumb', style }: ProductThumbProps) {
  if (looksLikeImage(icon)) {
    return (
      <div className={className} style={{ ...style, padding: 0, overflow: 'hidden' }}>
        <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }

  return (
    <div className={className} style={style}>
      {icon}
    </div>
  )
}
