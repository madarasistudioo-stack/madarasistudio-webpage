"use client";

import Link from "next/link";
import { GopuramIcon } from "@/components/Icons";
import { CATEGORIES } from "@/lib/products";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-mist bg-cloud/40">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg text-pine">
            <GopuramIcon className="h-6 w-6 text-olive" />
            Madarasi Studio
          </div>
          <p className="mt-3 max-w-xs text-sm text-pine/60">
            Personalised photobooks, journals, planners and notebooks, made for people who keep their
            Madras close.
          </p>
        </div>

        <FooterColumn
          title="Shop"
          links={[
            ...CATEGORIES.map((c) => ({ href: `/shop/${c.slug}`, label: c.name })),
          ]}
        />

        <FooterColumn
          title="Studio"
          links={[
            { href: "/about", label: "Our story" },
            { href: "/auth/signin", label: "Sign in" },
            { href: "/cart", label: "Your bag" },
          ]}
        />

        <div>
          <h3 className="font-display text-sm text-pine">Stay in the loop</h3>
          <p className="mt-2 text-sm text-pine/60">New designs, once in a while. No spam.</p>
          <form className="mt-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="w-full rounded-md border border-mist bg-ivory px-3 py-2 text-sm text-pine placeholder:text-pine/35 focus:border-olive"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-olive px-3 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-90"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-mist">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-pine/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Madarasi Studio. All rights reserved.</p>
          <p>Made in Chennai.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="font-display text-sm text-pine">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-pine/60">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-olive">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
