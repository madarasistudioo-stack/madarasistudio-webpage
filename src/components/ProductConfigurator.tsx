"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getCategory, getProductBySlug, type OptionChoice } from "@/lib/products";
import { getQuoteSuggestions } from "@/lib/quotes";
import { cn, formatRupees } from "@/lib/utils";
import { ProductArt } from "@/components/ProductArt";
import { ColorSwatches } from "@/components/ColorSwatches";
import { PhotoTemplatePicker, layoutForCollection, type PhotoSlot } from "@/components/PhotoTemplatePicker";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";
import { useCart } from "@/components/CartProvider";

export function ProductConfigurator({ slug }: { slug: string }) {
  const product = getProductBySlug(slug)!;
  const { options, art } = getCategory(product.categorySlug)!;
  const { addItem } = useCart();

  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(options.sizes.find((s) => s.id === options.defaultSizeId) ?? options.sizes[0]);
  const [pages, setPages] = useState(options.pages?.[0]);
  const [photos, setPhotos] = useState<PhotoSlot[]>([]);
  const [text, setText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showAssistant, setShowAssistant] = useState(false);
  const [added, setAdded] = useState(false);

  const delta = size.priceDelta + (pages?.priceDelta ?? 0);
  const price = product.price + delta;
  const slotCount = size.photoSlots ?? options.photoSlots;
  const ready = photos.filter((p) => p.status === "ready");
  const uploading = photos.some((p) => p.status === "uploading");
  const quotes = useMemo(() => getQuoteSuggestions(product.primaryCollection), [product.primaryCollection]);

  function add() {
    addItem({
      slug: product.slug,
      name: product.name,
      kind: product.kind,
      price,
      color: color.name,
      size: `${size.label} (${size.dimensions})`,
      pageCount: pages?.label,
      photos: ready.map((p) => p.url as string),
      personalisation: text || undefined,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="lg:sticky lg:top-36 lg:self-start">
        <ProductArt
          kind={art}
          icon={product.icon}
          color={color.hex}
          palette={product.palette.map((c) => c.hex)}
          title={text && art !== "book" ? text : product.name}
          subtitle={product.kind}
        />
      </div>

      <div>
        <p className="text-sm text-pine/50">{product.category}</p>
        <h1 className="mt-1 font-display text-3xl text-pine">{product.name}</h1>
        <p className="mt-1 text-pine/50">{product.kind}</p>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-xl text-pine">{formatRupees(price)}</span>
          {product.compareAt && <span className="text-sm text-pine/40 line-through">{formatRupees(product.compareAt + delta)}</span>}
        </div>
        <p className="mt-4 max-w-md text-pine/70">{product.blurb}</p>

        <div className="mt-6">
          <ColorSwatches title={options.colorLabel} colors={product.colors} selected={color} onSelect={setColor} />
        </div>
        <Choices title={options.sizeLabel} options={options.sizes} selected={size} onSelect={setSize} />
        {options.pages && pages && <Choices title="Pages" options={options.pages} selected={pages} onSelect={setPages} />}

        {slotCount > 0 && (
          <div className="mt-6 max-w-md">
            <PhotoTemplatePicker
              slotCount={slotCount}
              label={options.photoLabel}
              layout={layoutForCollection(product.primaryCollection)}
              onChange={setPhotos}
            />
          </div>
        )}

        <div className="mt-6 max-w-md">
          <label className="text-sm text-pine/60" htmlFor="personalisation">
            {options.textLabel}
          </label>
          <input
            id="personalisation"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={options.textPlaceholder}
            maxLength={options.textMax}
            className="mt-2 w-full rounded-md border border-mist bg-cloud px-3 py-2 text-sm text-pine placeholder:text-pine/35 focus:border-olive"
          />
          {art === "book" && (
            <div className="mt-2 flex flex-wrap gap-2">
              {quotes.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setText(q.slice(0, options.textMax))}
                  className="rounded-full border border-mist px-3 py-1 text-xs text-pine/60 hover:border-olive hover:text-pine"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <button type="button" onClick={() => setShowAssistant((v) => !v)} className="mt-2 text-xs text-olive hover:underline">
            {showAssistant ? "Hide ideas" : "Need an idea? Ask your Madarasi!"}
          </button>
        </div>
        {showAssistant && (
          <div className="mt-4 max-w-md">
            <AIAssistantWidget variant="inline" productContext={{ name: product.name, kind: product.kind }} />
          </div>
        )}

        <div className="mt-6 flex max-w-md items-center gap-4">
          <div className="flex items-center rounded-md border border-mist">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-pine/70" aria-label="Decrease quantity">
              −
            </button>
            <span className="w-8 text-center text-pine">{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 text-pine/70" aria-label="Increase quantity">
              +
            </button>
          </div>
          <button
            disabled={uploading}
            onClick={add}
            className="flex-1 rounded-md bg-olive px-5 py-3 text-sm font-medium text-ivory hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "Photos still uploading…" : added ? "Added to bag ✓" : `Add to bag · ${formatRupees(price * quantity)}`}
          </button>
        </div>
        {ready.length > 0 && <p className="mt-2 text-xs text-pine/40">{ready.length} photo(s) will be sent with this order.</p>}
        <Link href="/cart" className="mt-3 inline-block text-sm text-pine/60 hover:text-olive">
          View bag
        </Link>
      </div>
    </div>
  );
}

function Choices({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: OptionChoice[];
  selected: OptionChoice;
  onSelect: (o: OptionChoice) => void;
}) {
  return (
    <div className="mt-6">
      <p className="text-sm text-pine/60">
        {title}: <span className="text-pine">{selected.label}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o)}
            className={cn(
              "rounded-md border px-3 py-2 text-left text-sm transition-colors",
              selected.id === o.id ? "border-olive bg-olive/10 text-pine" : "border-mist text-pine/70 hover:border-olive"
            )}
          >
            <span className="block font-medium">{o.label}</span>
            {o.dimensions && <span className="block text-xs text-pine/45">{o.dimensions}</span>}
            {o.priceDelta !== 0 && (
              <span className="block text-[11px] text-pine/45">
                {o.priceDelta > 0 ? "+" : "−"}
                {formatRupees(Math.abs(o.priceDelta))}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
