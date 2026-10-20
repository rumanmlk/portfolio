import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'accent' | 'surface';
type Size = 'default' | 'small';

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type AnchorProps = Common & { href: string; external?: boolean } & Omit<
    ComponentPropsWithoutRef<'a'>,
    'href' | 'className' | 'children'
  >;

type NativeProps = Common & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<'button'>,
    'className' | 'children'
  >;

export type ButtonProps = AnchorProps | NativeProps;

function classes(variant: Variant, size: Size, className: string) {
  return [
    'btn',
    variant === 'accent' ? 'btn-accent' : 'btn-surface',
    size === 'small' ? 'btn-small' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Real anchor or button, keyboard reachable, with the site's hard-shadow style. */
export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const {
      variant = 'surface',
      size = 'default',
      className = '',
      children,
      external,
      href,
      ...rest
    } = props;
    const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <a href={href} className={classes(variant, size, className)} {...externalProps} {...rest}>
        {children}
      </a>
    );
  }
  const {
    variant = 'surface',
    size = 'default',
    className = '',
    children,
    type = 'button',
    ...rest
  } = props;
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
