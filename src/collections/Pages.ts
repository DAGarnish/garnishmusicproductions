import type { CollectionConfig } from 'payload';
import { HeroBlock } from '../blocks/HeroBlock';
import { CourseGridBlock } from '../blocks/CourseGridBlock';
import { FeatureGridBlock } from '../blocks/FeatureGridBlock';
import { CTABlock } from '../blocks/CTABlock';
import { RichTextBlock } from '../blocks/RichTextBlock';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'tenant', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'tenant',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'www',
      options: [
        { label: 'Main (www)', value: 'www' },
        { label: 'Los Angeles (la)', value: 'la' },
        { label: 'New York (ny)', value: 'ny' },
        { label: 'Berlin (ber)', value: 'ber' },
        { label: 'Nashville (nsh)', value: 'nsh' },
        { label: 'Tokyo (tyo)', value: 'tyo' },
        { label: 'Barcelona (bcn)', value: 'bcn' },
        { label: 'Seattle (sea)', value: 'sea' },
        { label: 'Miami (mia)', value: 'mia' },
        { label: 'Houston (hou)', value: 'hou' },
        { label: 'Sydney (syd)', value: 'syd' },
        { label: 'Lisbon (lis)', value: 'lis' },
        { label: 'San Francisco (sf)', value: 'sf' },
        { label: 'Singapore (sg)', value: 'sg' },
        { label: 'Portland (pdx)', value: 'pdx' },
        { label: 'Global Hub (edu)', value: 'edu' },
      ],
    },
    {
      name: 'wpPostId',
      type: 'number',
      label: 'Original WordPress Post ID (for tracking migration)',
      index: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        HeroBlock,
        CourseGridBlock,
        FeatureGridBlock,
        CTABlock,
        RichTextBlock,
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
};
