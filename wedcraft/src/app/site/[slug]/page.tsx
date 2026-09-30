import PublicWeddingSiteClient from "./ClientPage";

export function generateStaticParams() {
  return [{ slug: "preview" }];
}

export default function Page() {
  return <PublicWeddingSiteClient />;
}
