import Image from "next/image";
import Link from "next/link";
import styles from "./SidebarItem.module.css";

interface SidebarItemProps {
  src: string;
  alt: string;
  href: string;
}

export default function SidebarItem({ src, alt, href }: SidebarItemProps) {
    return (
    <div className={styles.sidebar__item}>
      <Link href={href} className={styles.sidebar__link}>
        <Image
          className={styles.sidebar__img}
          src={src}
          alt={alt}
          width={250}
          height={170}
        />
      </Link>
    </div>
  );
}