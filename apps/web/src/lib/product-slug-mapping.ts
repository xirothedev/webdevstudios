// Map frontend URL slugs to backend ProductSlug enums
export const URL_SLUG_TO_BACKEND_SLUG: Record<
  string,
  'AO_THUN' | 'PAD_CHUOT' | 'DAY_DEO' | 'MOC_KHOA'
> = {
  'ao-thun': 'AO_THUN',
  'pad-chuot': 'PAD_CHUOT',
  'day-deo': 'DAY_DEO',
  'moc-khoa': 'MOC_KHOA',
};

export const getBackendSlug = (
  urlSlug: string
): 'AO_THUN' | 'PAD_CHUOT' | 'DAY_DEO' | 'MOC_KHOA' => {
  const backendSlug = URL_SLUG_TO_BACKEND_SLUG[urlSlug];
  if (!backendSlug) {
    throw new Error(`Invalid product slug: ${urlSlug}`);
  }
  return backendSlug;
};
