interface Props {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}

export default function Avatar({ src, name, size = 40, className }: Props) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={className || 'rounded-circle object-fit-cover'}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center bg-secondary text-white fw-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
