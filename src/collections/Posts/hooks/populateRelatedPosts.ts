import { CollectionAfterReadHook } from 'payload';
import { Post } from 'src/payload-types'; // Adjust to your actual type location

export const populateRelatedPosts: CollectionAfterReadHook<Post> = async ({ doc, req, req: { payload } }) => {
  if (doc?.relatedPosts && Array.isArray(doc.relatedPosts)) {
    const populatedRelatedPosts: Array<{
      id: string;
      title: string;
      categories: string | null;
      slug: string | null;
      featureImage?: string;
      meta?: {
        title?: string | null;
        image?: string;
        description?: string | null;
      };
    }> = [];

    for (const relatedPost of doc.relatedPosts) {
      const relatedPostDoc = await payload.findByID({
        collection: 'posts',
        id: typeof relatedPost === 'object' ? relatedPost?.id : relatedPost,
        depth: 1, // Adjust depth as needed
        req,
      });

      if (relatedPostDoc) {
        populatedRelatedPosts.push({
          id: relatedPostDoc.id,
          title: relatedPostDoc.title,
          categories: Array.isArray(relatedPostDoc.categories)
            ? relatedPostDoc.categories
                .map((cat: any) => cat.title) // Extract the title for each category
                .join(', ') || null
            : null,
          slug: relatedPostDoc.slug ?? null,
          featureImage:
            typeof relatedPostDoc.featureImage === 'string'
              ? relatedPostDoc.featureImage
              : relatedPostDoc.featureImage?.url || undefined,
          meta: {
            title: relatedPostDoc.meta?.title ?? null,
            image:
              typeof relatedPostDoc.meta?.image === 'string'
                ? relatedPostDoc.meta?.image
                : relatedPostDoc.meta?.image?.url || undefined,
            description: relatedPostDoc.meta?.description ?? null,
          },
        });
      }
    }

    doc.relatedPosts = populatedRelatedPosts as unknown as (string | Post)[]; // Adjust this cast if needed
  }

  return doc;
};
