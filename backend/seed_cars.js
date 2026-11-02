require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { VEHICLES_DATA } = require('D:\\Performax 1 Workspace\\02 Websites and Portals\\Client Showrooms\\Auto M Nabil\\js\\vehicles-data.js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function mapFuelType(str) {
  if (!str) return 'petrol';
  const s = str.toLowerCase();
  if (s.includes('hybrid')) return 'hybrid';
  if (s.includes('diesel') || s.includes('ديزل')) return 'diesel';
  if (s.includes('electric') || s.includes('كهرب')) return 'electric';
  return 'petrol';
}

function mapTransmission(str) {
  if (!str) return 'automatic';
  if (str.includes('يدوي') || str.toLowerCase().includes('manual')) return 'manual';
  return 'automatic';
}

function mapDriveType(str) {
  if (!str) return '2wd';
  const s = str.toLowerCase();
  if (s.includes('awd') || s.includes('quattro')) return 'awd';
  if (s.includes('4x4') || s.includes('4wd') || s.includes('دفع رباعي')) return '4wd';
  return '2wd';
}

async function seedCars() {
  console.log(`🚀 Starting migration of ${VEHICLES_DATA.length} cars into Supabase...`);

  for (const v of VEHICLES_DATA) {
    const carRecord = {
      slug: v.slug,
      make: v.brandEn,
      model: v.model,
      year: parseInt(v.year, 10),
      variant: v.shortTitle || v.model,
      body_type: v.specs?.bodyType || 'SUV',
      condition: 'certified',
      price: v.priceNumber,
      original_price: Math.round(v.priceNumber * 1.05),
      price_negotiable: false,
      mileage: v.specs?.mileageNumber || 0,
      fuel_type: mapFuelType(v.specs?.fuel),
      transmission: mapTransmission(v.specs?.transmission),
      engine_cc: parseInt(v.specs?.engine?.replace(/[^0-9]/g, '') || '2000', 10),
      horsepower: parseInt(v.specs?.horsepower?.replace(/[^0-9]/g, '') || '180', 10),
      color: v.specs?.exteriorColor || 'أسود',
      interior_color: v.specs?.interiorColor || 'جلد أسود',
      seats: 5,
      doors: 4,
      drive_type: mapDriveType(v.specs?.drivetrain),
      status: 'available',
      is_featured: true,
      is_published: true,
      description: v.description?.overview || v.title,
      features: (v.features || []).map(f => typeof f === 'string' ? f : f.name),
      images: (v.images || []).map(img => ({
        url: img.src,
        thumb: img.thumb || img.src,
        alt: img.alt || v.title,
        caption: img.caption || ''
      })),
      inspection_report: v.inspectionCertificate || null,
      meta_title: `${v.brandEn} ${v.model} ${v.year} | سوق أوتو محمد نبيل`,
      meta_description: v.description?.overview?.slice(0, 160) || v.title,
      whatsapp_desc: `مرحباً، أود الاستفسار عن سيارة ${v.title} المعروضة بسعر ${v.price}`
    };

    const { data, error } = await supabase
      .from('cars')
      .upsert(carRecord, { onConflict: 'slug' })
      .select('id, make, model, year, price');

    if (error) {
      console.error(`❌ Error migrating ${v.slug}:`, error.message);
    } else {
      console.log(`✅ Migrated: ${carRecord.make} ${carRecord.model} (${carRecord.year})`);
    }
  }

  console.log('🎉 Car migration completed!');
  process.exit(0);
}

seedCars().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
