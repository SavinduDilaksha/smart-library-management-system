const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Dynamic SVG Cover Images (URL-encoded to work in img src tags)
const cleanCodeCover = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 290" width="100%" height="100%"><rect width="200" height="290" fill="%230F172A"/><rect x="12" y="12" width="176" height="266" fill="none" stroke="%2310B981" stroke-width="2" stroke-dasharray="4 2" opacity="0.6"/><rect x="20" y="20" width="160" height="250" fill="none" stroke="%2338BDF8" stroke-width="1" opacity="0.4"/><text x="100" y="80" fill="%2338BDF8" font-family="system-ui, sans-serif" font-size="14" font-weight="800" letter-spacing="1" text-anchor="middle">CLEAN CODE</text><text x="100" y="105" fill="%2394A3B8" font-family="system-ui, sans-serif" font-size="8" font-weight="600" letter-spacing="2" text-anchor="middle">A HANDBOOK OF AGILE</text><text x="100" y="118" fill="%2394A3B8" font-family="system-ui, sans-serif" font-size="8" font-weight="600" letter-spacing="2" text-anchor="middle">SOFTWARE CRAFTSMANSHIP</text><circle cx="100" cy="170" r="22" fill="none" stroke="%2310B981" stroke-width="2" opacity="0.8"/><path d="M92,170 L108,170 M100,162 L100,178" stroke="%2338BDF8" stroke-width="2"/><text x="100" y="240" fill="%23F8FAFC" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Robert C. Martin</text></svg>`;

const gatsbyCover = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 290" width="100%" height="100%"><rect width="200" height="290" fill="%231E1B4B"/><rect x="10" y="10" width="180" height="270" fill="none" stroke="%23F59E0B" stroke-width="1.5" opacity="0.8"/><rect x="15" y="15" width="170" height="260" fill="none" stroke="%23F59E0B" stroke-width="0.75" opacity="0.5"/><text x="100" y="75" fill="%23F59E0B" font-family="Georgia, serif" font-size="16" font-weight="bold" letter-spacing="1" text-anchor="middle">The Great</text><text x="100" y="100" fill="%23F59E0B" font-family="Georgia, serif" font-size="20" font-weight="bold" letter-spacing="2" text-anchor="middle">GATSBY</text><line x1="40" y1="120" x2="160" y2="120" stroke="%23F59E0B" stroke-width="1" opacity="0.6"/><path d="M100,140 L115,165 L85,165 Z" fill="%23312E81" stroke="%23F59E0B" stroke-width="1.5"/><text x="100" y="235" fill="%23E2E8F0" font-family="system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="1.5" text-anchor="middle">F. SCOTT FITZGERALD</text></svg>`;

const prideCover = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 290" width="100%" height="100%"><rect width="200" height="290" fill="%23831843"/><rect x="12" y="12" width="176" height="266" fill="none" stroke="%23FBCFE8" stroke-width="1" opacity="0.5"/><rect x="18" y="18" width="164" height="254" fill="none" stroke="%23FBCFE8" stroke-width="2" opacity="0.2"/><text x="100" y="70" fill="%23FBCFE8" font-family="Georgia, serif" font-size="15" font-style="italic" text-anchor="middle">Pride</text><text x="100" y="92" fill="%23FBCFE8" font-family="system-ui, sans-serif" font-size="8" font-weight="bold" letter-spacing="3" text-anchor="middle">AND</text><text x="100" y="120" fill="%23FBCFE8" font-family="Georgia, serif" font-size="17" font-style="italic" text-anchor="middle">Prejudice</text><path d="M80,155 C80,140 120,140 120,155 C120,170 80,170 80,155 Z" fill="none" stroke="%23FBCFE8" stroke-width="1.5" opacity="0.7"/><text x="100" y="235" fill="%23FDF2F8" font-family="system-ui, sans-serif" font-size="10" font-weight="600" letter-spacing="1" text-anchor="middle">JANE AUSTEN</text></svg>`;

const sapiansCover = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 290" width="100%" height="100%"><rect width="200" height="290" fill="%237C2D12"/><rect x="12" y="12" width="176" height="266" fill="none" stroke="%23FED7AA" stroke-width="1" opacity="0.6"/><text x="100" y="80" fill="%23FED7AA" font-family="Impact, Charcoal, sans-serif" font-size="28" letter-spacing="2" text-anchor="middle">Sapiens</text><text x="100" y="110" fill="%23FED7AA" font-family="system-ui, sans-serif" font-size="7" font-weight="800" letter-spacing="1.5" text-anchor="middle">A BRIEF HISTORY OF HUMANKIND</text><circle cx="100" cy="170" r="24" fill="%239A3412" stroke="%23FED7AA" stroke-width="1"/><path d="M90,170 Q100,150 110,170 Q100,190 90,170 Z" fill="%23FED7AA" opacity="0.8"/><text x="100" y="240" fill="%23FEE8D6" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Yuval Noah Harari</text></svg>`;

async function main() {
  console.log('🗑️ Clearing existing database data...');
  
  // Clear tables in dependency order
  await prisma.fine.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.borrowRequest.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.settings.deleteMany({});
  
  console.log('✅ Database cleared');

  console.log('🌱 Seeding fresh database with all scenarios...');

  // 1. Settings
  const settings = await prisma.settings.create({
    data: {
      id: 'default',
      finePerDay: 5.0,
      maxBorrowDays: 14,
      maxBooksPerUser: 5,
      libraryName: 'Metropolitan Library',
      maxOnlineRequestsPerUser: 3,
      maxOnlineCopiesPerBook: 3,
    },
  });
  console.log('✅ Settings initialized');

  // 2. Encrypt passwords
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const staffPass = await bcrypt.hash('Staff@123', 10);
  const memberPass = await bcrypt.hash('Member@123', 10);
  const pendingPass = await bcrypt.hash('Pending@123', 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: { name: 'Sarah Admin', email: 'admin@library.com', password: adminPass, role: 'ADMIN', phone: '+94771234567', status: 'ACTIVE' },
  });
  const staff = await prisma.user.create({
    data: { name: 'David Staff', email: 'staff@library.com', password: staffPass, role: 'STAFF', phone: '+94771234568', status: 'ACTIVE' },
  });
  const member = await prisma.user.create({
    data: { name: 'Jane Member', email: 'member@library.com', password: memberPass, role: 'MEMBER', phone: '+94771234569', status: 'ACTIVE' },
  });
  const pendingMember = await prisma.user.create({
    data: { name: 'Alex Pending', email: 'pending@library.com', password: pendingPass, role: 'MEMBER', phone: '+94771234570', status: 'PENDING' },
  });
  console.log('✅ Users created (Admin, Staff, Active Member, Pending Member)');

  // 4. Create Books (Enforcing quantity >= 5)
  const booksData = [
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Technology',
      publisher: 'Prentice Hall',
      quantity: 8,
      available: 7, // 1 checked out
      description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn\'t have to be that way.',
      coverImage: cleanCodeCover,
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      category: 'Fiction',
      publisher: 'Scribner',
      quantity: 5,
      available: 4, // 1 checked out via issued request
      description: 'The Great Gatsby, F. Scott Fitzgerald\'s third book, stands as the supreme achievement of his career. This exemplary novel of the Jazz Age has been acclaimed by generations of readers.',
      coverImage: gatsbyCover,
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      isbn: '978-0141439518',
      category: 'Literature',
      publisher: 'Penguin Classics',
      quantity: 6,
      available: 5, // 1 reserved via APPROVED request
      description: 'Jane Austen\'s Pride and Prejudice is a classic comedy of manners that tells the story of five sisters and their search for love and financial security in 19th-century English society.',
      coverImage: prideCover,
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      isbn: '978-0062316097',
      category: 'History',
      publisher: 'Harper',
      quantity: 7,
      available: 6, // 1 reserved via PENDING request
      description: 'Destined to become a modern classic, Sapiens is a thrilling, provocative history of humankind that spans from the evolutionary origins of Homo sapiens to the present day.',
      coverImage: sapiansCover,
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0061120084',
      category: 'Fiction',
      publisher: 'Harper Perennial',
      quantity: 5,
      available: 4, // 1 checked out overdue
      description: 'Compassionate, dramatic, and deeply moving, To Kill A Mockingbird takes readers to the roots of human behavior - to innocence and experience, kindness and cruelty, love and hatred, humor and pathos.',
      coverImage: null,
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0553380163',
      category: 'Science',
      publisher: 'Bantam',
      quantity: 6,
      available: 6,
      description: 'Stephen Hawking\'s landmark science book explores the grandest questions of the universe, covering cosmology, black holes, space-time, and quantum mechanics in accessible language.',
      coverImage: null,
    }
  ];

  const books = [];
  for (const book of booksData) {
    const createdBook = await prisma.book.create({ data: book });
    books.push(createdBook);
  }
  console.log('✅ Books with cover images created (All have at least 5 copies)');

  const cleanCode = books.find(b => b.title === 'Clean Code');
  const gatsby = books.find(b => b.title === 'The Great Gatsby');
  const pride = books.find(b => b.title === 'Pride and Prejudice');
  const sapiens = books.find(b => b.title === 'Sapiens');
  const mockingbird = books.find(b => b.title === 'To Kill a Mockingbird');

  // 5. Create Checkouts (Issues)
  
  // Active checkout (Clean Code)
  await prisma.issue.create({
    data: {
      userId: member.id,
      bookId: cleanCode.id,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Due in 14 days
      status: 'ISSUED',
    }
  });

  // Overdue checkout + Fine (To Kill a Mockingbird)
  const overdueIssueDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // 20 days ago
  const overdueDueDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); // Due 6 days ago
  
  const overdueIssue = await prisma.issue.create({
    data: {
      userId: member.id,
      bookId: mockingbird.id,
      issueDate: overdueIssueDate,
      dueDate: overdueDueDate,
      status: 'OVERDUE',
    }
  });

  // Create outstanding Fine for overdue book
  await prisma.fine.create({
    data: {
      issueId: overdueIssue.id,
      userId: member.id,
      amount: 30.00, // 6 days * 5.0 fine rate
      status: 'PENDING',
    }
  });
  console.log('✅ Active and Overdue checkouts with fine records created');

  // 6. Create Online Borrow Requests
  
  // Pending request (Sapiens)
  await prisma.borrowRequest.create({
    data: {
      userId: member.id,
      bookId: sapiens.id,
      status: 'PENDING',
      requestDate: new Date(),
    }
  });

  // Approved request (Pride and Prejudice)
  await prisma.borrowRequest.create({
    data: {
      userId: member.id,
      bookId: pride.id,
      status: 'APPROVED',
      requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    }
  });

  // Issued request (The Great Gatsby)
  const issuedReq = await prisma.borrowRequest.create({
    data: {
      userId: member.id,
      bookId: gatsby.id,
      status: 'ISSUED',
      requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    }
  });

  // Accompanying issue record for the issued request
  await prisma.issue.create({
    data: {
      userId: member.id,
      bookId: gatsby.id,
      issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // issued yesterday
      dueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
      status: 'ISSUED',
    }
  });

  console.log('✅ Online Borrow Requests seeded (PENDING, APPROVED, ISSUED scenarios)');

  // 7. Initial notifications
  await prisma.notification.create({
    data: {
      userId: member.id,
      message: 'Welcome to the Metropolitan Library! Your membership is active.',
      type: 'INFO',
    }
  });
  await prisma.notification.create({
    data: {
      userId: member.id,
      message: `Your borrow request for "${pride.title}" was approved! Visit the counter to pick it up.`,
      type: 'SUCCESS',
    }
  });
  console.log('✅ Welcome and status notifications seeded');

  // 8. Log initial activities
  await prisma.activity.create({
    data: { userId: admin.id, action: 'SYSTEM_RESET', details: 'Database cleared and seeded with fresh mock data' }
  });

  console.log('🎉 Seeding successfully completed! All library scenarios are ready to test.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
