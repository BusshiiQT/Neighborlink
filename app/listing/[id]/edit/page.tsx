// app/listing/[id]/edit/page.tsx

export default function EditListingPage(props: any) {
  const id = props?.params?.id as string | undefined;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">
        Edit Listing {id ? `#${id}` : ""}
      </h1>

      {/* TODO: render your real edit form here */}
      <p className="mt-4 text-sm text-gray-500">
        Replace this with your edit form component.
      </p>
    </main>
  );
}

// ✅ Do not declare or export any type named PageProps in this file.
// ✅ Do not re-export anything from here; this file should only default-export the page component.
