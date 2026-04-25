import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ModelPage({
    params,
}: {
    params: Promise<{ city: string; slug: string }>;
}) {
    const { slug } = await params;

    permanentRedirect(`/model/${slug}`);
}
