const { v4: uuidv4 } = require('uuid');

const adminId = uuidv4();
const employeeId1 = uuidv4();
const employeeId2 = uuidv4();

const users = [
  {
    id: adminId,
    email: 'admin@realestate.com',
    password: '$2a$10$Qnw4gixAU6IbkWfjdCv60uaO2pYoe/RjmJv5NrJFbZCfZrSL/VR3u', // Admin123!
    role: 'admin',
    name: 'ნინო'
  },
  {
    id: employeeId1,
    email: 'employee@realestate.com',
    password: '$2a$10$QoYp/MBapHxyA5FPwn0D6eO.8yO/ZRbZKXun8uzrlYYr9fVEfpAAO', // Employee123!
    role: 'employee',
    name: 'ანანო',
    managerId: adminId
  },
  {
    id: employeeId2,
    email: 'giorgi@realestate.com',
    password: '$2a$10$QoYp/MBapHxyA5FPwn0D6eO.8yO/ZRbZKXun8uzrlYYr9fVEfpAAO', // Employee123!
    role: 'employee',
    name: 'გიორგი',
    managerId: adminId
  }
];

// Mock Properties with Georgian locations
const properties = [
  {
    id: uuidv4(),
    title: 'ფაქტორი კერძო სახლი',
    titleEn: 'Spacious House in Tbilisi',
    titleRu: 'Просторный дом в Тбилиси',
    description: 'ძალიან თვალი მოსახვევი კერძო სახლი თბილისის ფაქტორის უბანში',
    descriptionEn: 'Beautiful private house in Factors district with modern amenities',
    descriptionRu: 'Красивый частный дом в районе Факторз с современными удобствами',
    city: 'თბილისი', // Tbilisi
    cityEn: 'Tbilisi',
    cityRu: 'Тбилиси',
    zone: 'ფაქტორი',
    zoneEn: 'Factors',
    zoneRu: 'Факторз',
    type: 'sale', // sale or rent
    sqMeters: 250,
    bedrooms: 4,
    bathrooms: 2,
    floor: 2,
    price: 350000,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date('2024-01-15'),
    createdBy: adminId,
    status: 'active'
  },
  {
    id: uuidv4(),
    title: 'მოდერნული ბინა ვაკეში',
    titleEn: 'Modern Apartment in Vake',
    titleRu: 'Современная квартира в Ваке',
    description: 'ახლად რემონტირებული 2-ოთახიანი ბინა მშვიდი უბნით',
    descriptionEn: 'Recently renovated 2-bedroom apartment with beautiful view',
    descriptionRu: 'Недавно отремонтированная 2-комнатная квартира с красивым видом',
    city: 'თბილისი',
    cityEn: 'Tbilisi',
    cityRu: 'Тбилиси',
    zone: 'ვაკე',
    zoneEn: 'Vake',
    zoneRu: 'Ваке',
    type: 'rent',
    sqMeters: 85,
    bedrooms: 2,
    bathrooms: 1,
    floor: 5,
    price: 1200,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    createdAt: new Date('2024-02-10'),
    createdBy: adminId,
    status: 'active'
  },
  {
    id: uuidv4(),
    title: 'ოქროს ხიდის ბინა',
    titleEn: 'Apartment near Golden Bridge',
    titleRu: 'Квартира рядом с Золотым мостом',
    description: 'ნაჭილი ფერდი ოქროს ხიდის მახლობლად ხელი მოკიდებული პოზიცია',
    descriptionEn: 'Luxury apartment with stunning city views near Golden Bridge',
    descriptionRu: 'Люксовая квартира с потрясающим видом на город рядом с Золотым мостом',
    city: 'თბილისი',
    cityEn: 'Tbilisi',
    cityRu: 'Тбилиси',
    zone: 'ოქროს ხიდი',
    zoneEn: 'Golden Bridge',
    zoneRu: 'Золотой мост',
    type: 'sale',
    sqMeters: 120,
    bedrooms: 3,
    bathrooms: 2,
    floor: 12,
    price: 450000,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date('2024-01-05'),
    createdBy: adminId,
    status: 'active'
  },
  {
    id: uuidv4(),
    title: 'სიჰოვიტელი სახლი მწვანე ტერიტორიაზე',
    titleEn: 'Country Villa with Garden',
    titleRu: 'Загородная вилла с садом',
    description: 'დამაქვემდებარებელი სამეზობლო დიდი სახლი',
    descriptionEn: 'Spacious country villa with large garden and pool',
    descriptionRu: 'Просторная загородная вилла с большим садом и бассейном',
    city: 'თბილისი',
    cityEn: 'Tbilisi',
    cityRu: 'Тбилиси',
    zone: 'ციხე-დაბა',
    zoneEn: 'Tsikhe-Daba',
    zoneRu: 'Цихе-Баба',
    type: 'sale',
    sqMeters: 450,
    bedrooms: 5,
    bathrooms: 3,
    floor: 1,
    price: 850000,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    createdAt: new Date('2024-01-25'),
    createdBy: adminId,
    status: 'active'
  },
  {
    id: uuidv4(),
    title: 'იყიდება ბინა ისანში!',
    titleEn: 'Apartment for sale in Isani!',
    titleRu: 'Квартира на продажу в Исани!',
    description: '66 კვ.მ 3 ოთახიანი ნათელი, მყუდრო და სრულად მოწყობილი ბინა. 12 სართულიანი კორპუსის 11 სართული. სოლომონ დოდაშვილის 22 (ფრესკოს უკან). ბინა არის საცხოვრებლად სრულად მზად. რჩება ავეჯი და ტექნიკა. გამოყენებულია ხარისხიანი მასალები. ბინაში დაგხავდებათ: სრულად მოწყობილი სამზარეულო. საძინებლები ავეჯით. სარეცხი მანქანა და ტექნიკა. თანამედროვე სველი წერტილი საშხაპით. დიდი აივანი ულამაზესი ხედით მთასა და ქალაქზე. ბინა იდეალური არის როგორც საცხოვრებლად ასევე საინვესტიციოდ. ფასი პირადში. Telegram t.me/+995514279977',
    descriptionEn: '66 sqm, 3-room bright, cozy and fully furnished apartment. 11th floor of a 12-story building. Solomon Dodashvili 22 (behind Fresco). The apartment is fully ready for living. Furniture and appliances stay. High-quality materials were used. The apartment includes a fully equipped kitchen, furnished bedrooms, washing machine and appliances, a modern bathroom with shower, and a large balcony with beautiful mountain and city views. The apartment is ideal both for living and as an investment. Price in private. Telegram t.me/+995514279977',
    descriptionRu: '66 кв.м, 3-комнатная светлая, уютная и полностью меблированная квартира. 11 этаж 12-этажного дома. Соломона Додашвили 22 (за Fresco). Квартира полностью готова к проживанию. Мебель и техника остаются. Использованы качественные материалы. В квартире есть полностью оборудованная кухня, спальни с мебелью, стиральная машина и техника, современный санузел с душем, большой балкон с красивым видом на горы и город. Квартира идеально подходит как для проживания, так и для инвестиций. Цена в личных сообщениях. Telegram t.me/+995514279977',
    city: 'თბილისი',
    cityEn: 'Tbilisi',
    cityRu: 'Тбилиси',
    zone: 'ისანი',
    zoneEn: 'Isani',
    zoneRu: 'Исани',
    type: 'sale',
    sqMeters: 66,
    bedrooms: 3,
    bathrooms: 1,
    floor: 11,
    price: 0,
    currency: 'USD',
    priceNote: 'Price in private',
    contactMethod: 'Telegram',
    contactLink: 't.me/+995514279977',
    rawText: '✨იყიდება ბინა ისანში! ✨66 კვ.მ 3 ოთახიანი ნათელი, მყუდრო და სრულად მოწყობილი ბინა. 12 სართულიანი კორპუსის 11 სართული. სოლომონ დოდაშვილის 22 (ფრესკოს უკან) 💥ბინა არის საცხოვრებლად სრულად მზად. რჩება ავეჯი და ტექნიკა. გამოყენებულია ხარისხიანი მასალები. ბინაში დაგხავდებათ: 💥სრულად მოწყობილი სამზარეულო. 💥საძინებლები ავეჯით. 💥სარეცხი მანქანა და ტექნიკა. 💥თანამედროვე სველი წერტილი საშხაპით. 💥დიდი აივანი ულამაზესი ხედით მთასა და ქალაქზე. ბინა იდეალური არის როგორც საცხოვრებლად ასევე საინვესტიციოდ ფასი პირადში👌 ☎️დამიკავშირდით 🔵Telegram t.me/+995514279977',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: new Date('2026-05-19'),
    createdBy: adminId,
    status: 'active'
  },
];

// Contact messages (in-memory)
const contacts = [];

// Example: mark a property as sold/rented by a user
// We can add transaction fields to properties dynamically during runtime when a sale/rent happens

module.exports = {
  users,
  properties,
  contacts
};
