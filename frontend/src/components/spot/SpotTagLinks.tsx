import { Fragment } from "react";
import Link from "next/link";
import { ASK_LAYER_LABELS, toggleTag, type AskLayer } from "@/lib/ask-sentence";
import { buildSpotsHref, EMPTY_SPOT_FILTER } from "@/lib/spot-filter";

interface Tag {
  id: string;
  name: string;
}

interface SpotTagLinksProps {
  category: Tag;
  moodTags: Tag[];
  attributeTags: Tag[];
}

/** タグを層の名前ごとに文字で並べる。言葉を押すと、その言葉で絞り込んだ一覧へ移る */
export function SpotTagLinks({
  category,
  moodTags,
  attributeTags,
}: SpotTagLinksProps) {
  const rows: [AskLayer, Tag[]][] = [
    ["category", [category]],
    ["mood", moodTags],
    ["attribute", attributeTags],
  ];

  return (
    <dl className="grid grid-cols-[4.5em_1fr] gap-x-4 gap-y-3 text-[15px]">
      {rows
        .filter(([, tags]) => tags.length > 0)
        .map(([layer, tags]) => (
          <Fragment key={layer}>
            <dt className="pt-0.5 text-xs text-gray-500">
              {ASK_LAYER_LABELS[layer]}
            </dt>
            <dd className="leading-relaxed">
              {tags.map((tag, i) => (
                <Fragment key={tag.id}>
                  {i > 0 && (
                    <span className="mx-1.5 text-gray-300" aria-hidden="true">
                      ・
                    </span>
                  )}
                  <Link
                    href={buildSpotsHref(
                      toggleTag(EMPTY_SPOT_FILTER, layer, tag.id),
                    )}
                    className="rounded-sm text-primary-700 underline decoration-primary-200 underline-offset-4 transition-colors hover:decoration-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    {tag.name}
                  </Link>
                </Fragment>
              ))}
            </dd>
          </Fragment>
        ))}
    </dl>
  );
}
