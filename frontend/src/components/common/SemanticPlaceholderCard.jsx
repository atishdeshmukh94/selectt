import React from 'react';
import {
  CardGroup,
  CardContent,
  PlaceholderImage,
  Card,
  Placeholder,
  PlaceholderLine,
  PlaceholderParagraph,
  PlaceholderHeader
} from 'semantic-ui-react';

/**
 * PlaceholderExampleImageSquare
 * Direct implementation from Semantic UI React Elements Placeholder docs:
 * https://react.semantic-ui.com/elements/placeholder/#content-image-square
 */
export const PlaceholderExampleImageSquare = () => (
  <CardGroup itemsPerRow={3}>
    <Card>
      <CardContent>
        <Placeholder>
          <PlaceholderImage square />
        </Placeholder>
      </CardContent>
    </Card>
    <Card>
      <CardContent>
        <Placeholder>
          <PlaceholderImage square />
        </Placeholder>
      </CardContent>
    </Card>
    <Card>
      <CardContent>
        <Placeholder>
          <PlaceholderImage square />
        </Placeholder>
      </CardContent>
    </Card>
  </CardGroup>
);

/**
 * PlaceholderExampleLine
 * Direct implementation from Semantic UI React Elements Placeholder docs
 */
export const PlaceholderExampleLine = () => (
  <Placeholder>
    <PlaceholderLine />
    <PlaceholderLine />
    <PlaceholderLine />
    <PlaceholderLine />
    <PlaceholderLine />
  </Placeholder>
);

/**
 * SemanticCarCardSkeleton
 * Professional car card placeholder combining image and line placeholders
 */
export const SemanticCarCardSkeleton = () => (
  <div className="bg-white rounded-[20px] border border-slate-200/80 p-3 h-[380px] flex flex-col justify-between overflow-hidden shadow-xs">
    {/* Card Image Placeholder */}
    <Placeholder className="rounded-[14px] overflow-hidden">
      <PlaceholderImage rectangular />
    </Placeholder>

    {/* Content details placeholder */}
    <div className="mt-4 px-1">
      <Placeholder>
        <PlaceholderHeader>
          <PlaceholderLine length="medium" />
          <PlaceholderLine length="full" />
        </PlaceholderHeader>
        <PlaceholderParagraph>
          <PlaceholderLine length="very short" />
          <PlaceholderLine length="short" />
        </PlaceholderParagraph>
      </Placeholder>
    </div>
  </div>
);

/**
 * SemanticBannerSkeleton
 * Top promo banner placeholder with Semantic UI React shimmer
 */
export const SemanticBannerSkeleton = () => (
  <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white h-[180px] sm:h-[190px]">
    <Placeholder fluid className="h-full w-full">
      <PlaceholderImage rectangular className="!h-full !pb-0" />
    </Placeholder>
  </div>
);

export default PlaceholderExampleImageSquare;
