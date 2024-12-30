import { CollectionAfterReadHook } from 'payload';
import { Post } from 'src/payload-types'; // Adjust to your actual type location

export const populateRelatedPosts: CollectionAfterReadHook<Post> = async ({ doc, req, req: { payload } }) => {
    if (doc?.relatedPosts && Array.isArray(doc.relatedPosts)) {
        const populatedRelatedPosts: Array<{
            id: string;
            title: string;
            categories: string;
            slug: string | null;
            featureImage?: string | { url: string };
            meta?: {
                title?: string | null;
                image?: string | { url: string };
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
                    categories: relatedPostDoc.categories,
                    slug: relatedPostDoc.slug ?? null,  // fallback to null if slug is undefined
                    featureImage: relatedPostDoc.featureImage, // Include the featureImage
                    meta: relatedPostDoc.meta, // Include meta for SEO or card rendering
                });
            }
        }

        doc.relatedPosts = populatedRelatedPosts; // Replace with fully populated data
    }

    return doc;
};