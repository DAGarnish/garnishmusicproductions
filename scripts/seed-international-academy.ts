import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

async function seedInternationalAcademy() {
  console.log('Fetching international-academy from WordPress API...');
  const res = await fetch('https://edu.garnishmusicproduction.com/wp-json/wp/v2/pages?slug=international-academy');
  const pages = await res.json();
  
  if (!pages || pages.length === 0) {
    console.error('Could not find international-academy page from API.');
    process.exit(1);
  }
  
  const wpPage = pages[0];
  const title = wpPage.title.rendered;
  const rawContent = wpPage.content.rendered;
  const excerpt = wpPage.excerpt?.rendered || '';
  
  console.log(`Fetched page: ${title}`);
  
  console.log('Connecting to Payload / Neon DB...');
  const payload = await getPayload({ config: configPromise });

  const tenants = ['edu', 'www'];
  const slug = 'international-academy';

  for (const tenant of tenants) {
    const existing = await payload.find({
      collection: 'pages',
      where: {
        and: [
          { slug: { equals: slug } },
          { tenant: { equals: tenant } },
        ],
      },
    });

    // We will dump the raw HTML content into a RichText block
    const layout = [
      {
        blockType: 'richText',
        htmlContent: rawContent,
        containerWidth: 'prose',
      }
    ];

    const dataToSave = {
      title,
      slug,
      tenant: tenant as any,
      layout,
      seo: {
        metaTitle: `${title} | Garnish ${tenant.toUpperCase()}`,
        metaDescription: excerpt.replace(/<[^>]*>/g, '').substring(0, 160),
      },
    };

    if (existing.docs.length > 0) {
      console.log(`Updating existing page for tenant "${tenant}"...`);
      await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data: dataToSave as any,
      });
    } else {
      console.log(`Creating new page for tenant "${tenant}"...`);
      await payload.create({
        collection: 'pages',
        data: dataToSave as any,
      });
    }
  }

  console.log('Seed completed successfully.');
  process.exit(0);
}

seedInternationalAcademy().catch((err) => {
  console.error('Error seeding international-academy:', err);
  process.exit(1);
});
