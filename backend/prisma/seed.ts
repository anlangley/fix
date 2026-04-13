import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with sample rooms...');

  // Xóa dữ liệu cũ (tuân thủ foreign key)
  await prisma.roomImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();

  // Tạo phòng mẫu
  const room1 = await prisma.room.create({
    data: {
      name: 'Phòng Deluxe Ocean View',
      type: 'DOUBLE',
      pricePerNight: 2500000,
      location: 'Đà Nẵng',
      description: 'Phòng hướng biển tuyệt đẹp với ban công riêng, bồn tắm sục và các tiện ích cao cấp dành cho kỳ nghỉ lãng mạn.',
      capacityAdults: 2,
      capacityChildren: 1,
      status: 'AVAILABLE',
      amenities: JSON.stringify([
        { icon: 'wifi', label: 'Wi-Fi miễn phí' },
        { icon: 'tv-outline', label: 'Smart TV' },
        { icon: 'water-outline', label: 'Hướng biển' }
      ]),
      avgRating: 4.8,
      reviewCount: 124,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', isPrimary: true, order: 1 }
        ]
      }
    }
  });

  const room2 = await prisma.room.create({
    data: {
      name: 'Suite Tổng Thống',
      type: 'VIP',
      pricePerNight: 8000000,
      location: 'Hà Nội',
      description: 'Căn hộ khách sạn sang trọng bậc nhất với phòng khách riêng, dịch vụ quản gia 24/7 và view toàn cảnh thành phố.',
      capacityAdults: 4,
      capacityChildren: 2,
      status: 'AVAILABLE',
      amenities: JSON.stringify([
        { icon: 'wifi', label: 'Wi-Fi miễn phí' },
        { icon: 'restaurant-outline', label: 'Ăn sáng miễn phí' },
        { icon: 'wine-outline', label: 'Quầy bar' }
      ]),
      avgRating: 4.9,
      reviewCount: 89,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', isPrimary: true, order: 1 }
        ]
      }
    }
  });

  const room3 = await prisma.room.create({
    data: {
      name: 'Phòng Superior Garden',
      type: 'SINGLE',
      pricePerNight: 1800000,
      location: 'Hồ Chí Minh',
      description: 'Không gian yên tĩnh với view hướng ra khu vườn nhiệt đới, phù hợp cho những chuyến công tác.',
      capacityAdults: 1,
      capacityChildren: 0,
      status: 'AVAILABLE',
      amenities: JSON.stringify([
        { icon: 'wifi', label: 'Wi-Fi miễn phí' },
        { icon: 'cafe-outline', label: 'Trà/Cà phê' }
      ]),
      avgRating: 4.6,
      reviewCount: 256,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', isPrimary: true, order: 1 }
        ]
      }
    }
  });

  console.log('Seed success!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
