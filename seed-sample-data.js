// Seed database with realistic sample data
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedData() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'edufund'
    });

    console.log('✓ Connected to database\n');

    // Get user IDs
    const [users] = await connection.query('SELECT id, email, role FROM users');
    const studentUser = users.find(u => u.role === 'student');
    const donorUser = users.find(u => u.role === 'donor');
    const adminUser = users.find(u => u.role === 'admin');

    console.log('Creating sample campaigns...');

    // Sample campaigns with realistic data
    const campaigns = [
      {
        title: 'Help Fatima Complete Her Engineering Degree',
        description: `My name is Fatima El Amrani, and I am a dedicated engineering student at ENSAM Casablanca, pursuing my dream of becoming a mechanical engineer. I come from a modest family in the Atlas Mountains, and despite my hard work and academic achievements, financial constraints are threatening my ability to complete my final year.

I have maintained excellent grades throughout my studies and have been offered an internship at a leading manufacturing company. However, I need support to cover tuition fees, textbooks, and living expenses for my final year.

Your contribution will help me:
- Complete my engineering degree
- Attend important industry conferences
- Purchase necessary software licenses
- Focus on my studies without financial stress

Every donation, no matter how small, brings me closer to achieving my dream and giving back to my community.`,
        goal_amount: 45000,
        current_amount: 28500,
        category: 'Engineering',
        city: 'Casablanca',
        university: 'ENSAM Casablanca',
        cover_image: '/uploads/engineering-student.jpg',
        status: 'active',
        end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        user_id: studentUser.id,
        featured: 1,
        student_name: 'Fatima El Amrani',
        student_university: 'ENSAM Casablanca',
        student_field: 'Mechanical Engineering',
        student_year: 'Final Year',
        verification_status: 'verified',
        trust_score: 95,
        tags: 'engineering,STEM,scholarship,casablanca',
        allow_anonymous: 1,
        allow_comments: 1
      },
      {
        title: 'Medical Student Needs Support for Final Year',
        description: `Salaam! I'm Youssef Bennani, a fifth-year medical student at the Faculty of Medicine in Rabat. Medicine has always been my passion, and I dream of becoming a doctor to serve rural communities in Morocco.

Coming from a family of farmers in the Rif region, I've worked hard to get where I am today. I've been funding my education through part-time work and small scholarships, but my final year requires full-time clinical rotations, making it impossible to work.

I need financial support to cover:
- Clinical rotation fees and medical equipment
- Accommodation near the teaching hospital
- Medical textbooks and study materials
- USMLE exam preparation costs

Your support will help me complete my medical degree and return to serve underserved communities in rural Morocco.`,
        goal_amount: 60000,
        current_amount: 42300,
        category: 'Medicine',
        city: 'Rabat',
        university: 'Faculty of Medicine - Rabat',
        cover_image: '/uploads/medical-student.jpg',
        status: 'active',
        end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        user_id: studentUser.id,
        featured: 1,
        student_name: 'Youssef Bennani',
        student_university: 'Faculty of Medicine - Rabat',
        student_field: 'Medicine',
        student_year: '5th Year',
        verification_status: 'verified',
        trust_score: 98,
        tags: 'medicine,healthcare,scholarship,rabat',
        allow_anonymous: 1,
        allow_comments: 1
      },
      {
        title: 'Computer Science Student Pursuing AI Research',
        description: `Hello! I'm Amine Chakir, a Master's student in Computer Science at Mohammed V University, specializing in Artificial Intelligence and Machine Learning. I'm passionate about using technology to solve real-world problems in Morocco.

I've been accepted into a prestigious research program at MIT for a semester exchange, which is an incredible opportunity to advance my skills and bring knowledge back to Morocco. However, the program costs are beyond my family's means.

Your support will help cover:
- Semester exchange program fees
- Research materials and computing resources
- Travel and visa expenses
- Accommodation in Boston

This opportunity will not only benefit my education but also help me build connections to bring advanced AI education to Moroccan universities.`,
        goal_amount: 75000,
        current_amount: 15800,
        category: 'Computer Science',
        city: 'Rabat',
        university: 'Mohammed V University',
        cover_image: '/uploads/cs-student.jpg',
        status: 'active',
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        user_id: studentUser.id,
        featured: 0,
        student_name: 'Amine Chakir',
        student_university: 'Mohammed V University',
        student_field: 'Computer Science - AI',
        student_year: 'Master\'s Program',
        verification_status: 'verified',
        trust_score: 92,
        tags: 'computer-science,AI,research,exchange-program',
        allow_anonymous: 1,
        allow_comments: 1
      },
      {
        title: 'Business Student from Rural Area Needs Support',
        description: `My name is Sanaa Idrissi, and I'm studying Business Administration at Al Akhawayn University in Ifrane. Being the first in my family to attend university, I carry the hopes and dreams of my entire village in the Middle Atlas.

I've worked incredibly hard to get here, balancing my studies with multiple jobs. However, this semester's tuition and expenses are overwhelming. I need support to continue my education and eventually bring economic development opportunities back to my community.

Your contribution will help with:
- Tuition fees for the upcoming semester
- Business course materials and case studies
- Professional development workshops
- Living expenses

I promise to pay it forward by creating opportunities for other students from rural areas.`,
        goal_amount: 38000,
        current_amount: 31200,
        category: 'Business',
        city: 'Ifrane',
        university: 'Al Akhawayn University',
        cover_image: '/uploads/business-student.jpg',
        status: 'active',
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        user_id: studentUser.id,
        featured: 1,
        student_name: 'Sanaa Idrissi',
        student_university: 'Al Akhawayn University',
        student_field: 'Business Administration',
        student_year: '3rd Year',
        verification_status: 'verified',
        trust_score: 89,
        tags: 'business,rural-student,scholarship,ifrane',
        allow_anonymous: 1,
        allow_comments: 1
      },
      {
        title: 'Architecture Student Needs Materials for Final Project',
        description: `Bonjour! I'm Karim Alaoui, an architecture student at EAC (École d'Architecture de Casablanca). I'm in my final year and working on my graduation project - designing sustainable housing solutions for low-income communities in Casablanca.

My project has been selected for an international architecture competition, but I need funds to create professional models, 3D renderings, and presentation materials.

Support needed for:
- 3D printing materials and model construction
- Professional rendering software licenses
- Competition registration and submission fees
- Documentation and photography

This project could make a real difference in addressing Morocco's housing challenges, and your support will help bring this vision to life.`,
        goal_amount: 25000,
        current_amount: 18900,
        category: 'Architecture',
        city: 'Casablanca',
        university: 'École d\'Architecture de Casablanca',
        cover_image: '/uploads/architecture-student.jpg',
        status: 'active',
        end_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        user_id: studentUser.id,
        featured: 0,
        student_name: 'Karim Alaoui',
        student_university: 'EAC Casablanca',
        student_field: 'Architecture',
        student_year: 'Final Year',
        verification_status: 'pending',
        trust_score: 85,
        tags: 'architecture,sustainability,competition,casablanca',
        allow_anonymous: 1,
        allow_comments: 1
      },
      {
        title: 'Law Student Working Towards Social Justice',
        description: `I'm Leila Zahraoui, studying Law at Hassan II University in Casablanca with a focus on human rights and social justice. I come from a working-class family in Derb Ghallef, and I've seen firsthand the legal challenges facing marginalized communities.

My goal is to provide legal aid to those who cannot afford it, but first, I need to complete my education. This semester has been particularly challenging financially, and I'm seeking support to continue my studies.

Your donation will help with:
- Law textbooks and legal databases subscriptions
- Court observation trips and legal clinics
- Bar exam preparation courses
- Living expenses while studying

Every contribution helps me get closer to defending those who need it most.`,
        goal_amount: 32000,
        current_amount: 8500,
        category: 'Law',
        city: 'Casablanca',
        university: 'Hassan II University',
        cover_image: '/uploads/law-student.jpg',
        status: 'active',
        end_date: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
        user_id: studentUser.id,
        featured: 0,
        student_name: 'Leila Zahraoui',
        student_university: 'Hassan II University',
        student_field: 'Law - Human Rights',
        student_year: '4th Year',
        verification_status: 'verified',
        trust_score: 91,
        tags: 'law,human-rights,social-justice,casablanca',
        allow_anonymous: 1,
        allow_comments: 1
      }
    ];

    const campaignIds = [];
    for (const campaign of campaigns) {
      const [result] = await connection.query(
        `INSERT INTO campaigns (title, description, goal_amount, current_amount, category, city,
        university, cover_image, status, end_date, user_id, featured, student_name,
        student_university, student_field, student_year, verification_status, trust_score,
        tags, allow_anonymous, allow_comments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          campaign.title, campaign.description, campaign.goal_amount, campaign.current_amount,
          campaign.category, campaign.city, campaign.university, campaign.cover_image,
          campaign.status, campaign.end_date, campaign.user_id, campaign.featured,
          campaign.student_name, campaign.student_university, campaign.student_field,
          campaign.student_year, campaign.verification_status, campaign.trust_score,
          campaign.tags, campaign.allow_anonymous, campaign.allow_comments
        ]
      );
      campaignIds.push(result.insertId);
      console.log(`  ✓ Created: ${campaign.title}`);
    }

    console.log('\n✓ Created', campaignIds.length, 'campaigns');

    // Add donations
    console.log('\nCreating sample donations...');
    const donations = [
      // Campaign 1 donations
      { campaign_id: campaignIds[0], donor_name: 'Ahmed Benali', donor_email: 'ahmed@example.com', amount: 5000, donor_message: 'Keep up the great work! Education is the key to success.' },
      { campaign_id: campaignIds[0], donor_name: 'Sarah Martinez', donor_email: 'sarah@example.com', amount: 3000, donor_message: 'Wishing you all the best in your studies!' },
      { campaign_id: campaignIds[0], donor_name: 'Anonymous', is_anonymous: 1, amount: 2500, donor_message: 'Someone believes in you!' },
      { campaign_id: campaignIds[0], donor_name: 'Omar Tazi', donor_email: 'omar.t@example.com', amount: 8000, donor_message: 'As a fellow engineer, I know how important education support is. Good luck!' },
      { campaign_id: campaignIds[0], donor_name: 'Fatima Idrissi', donor_email: 'fatima.i@example.com', amount: 1500, donor_message: 'Every bit helps. Stay strong!' },
      { campaign_id: campaignIds[0], donor_name: 'Mohamed Alami', donor_email: 'mohamed.a@example.com', amount: 4000, donor_message: 'Proud to support future engineers!' },
      { campaign_id: campaignIds[0], donor_name: 'Nadia Bennani', donor_email: 'nadia@example.com', amount: 2000, donor_message: 'You got this!' },
      { campaign_id: campaignIds[0], donor_name: 'Youssef Cherif', donor_email: 'youssef.c@example.com', amount: 2500, donor_message: 'Best wishes from Marrakech!' },

      // Campaign 2 donations
      { campaign_id: campaignIds[1], donor_name: 'Dr. Karim Fassi', donor_email: 'dr.karim@example.com', amount: 10000, donor_message: 'Future doctors need our support. You will make an excellent physician!' },
      { campaign_id: campaignIds[1], donor_name: 'Laila Moussa', donor_email: 'laila@example.com', amount: 5000, donor_message: 'My son is also in medical school. I understand the challenges!' },
      { campaign_id: campaignIds[1], donor_name: 'Anonymous', is_anonymous: 1, amount: 7500, donor_message: 'Rural communities need dedicated doctors. Thank you for your commitment!' },
      { campaign_id: campaignIds[1], donor_name: 'Rachid Amrani', donor_email: 'rachid@example.com', amount: 3000, donor_message: 'Keep saving lives!' },
      { campaign_id: campaignIds[1], donor_name: 'Samira El Khatib', donor_email: 'samira@example.com', amount: 4800, donor_message: 'Your dedication is inspiring!' },
      { campaign_id: campaignIds[1], donor_name: 'Hassan Bouzid', donor_email: 'hassan.b@example.com', amount: 6000, donor_message: 'Morocco needs more doctors like you!' },
      { campaign_id: campaignIds[1], donor_name: 'Zineb Tahiri', donor_email: 'zineb@example.com', amount: 6000, donor_message: 'Supporting future healthcare heroes!' },

      // Campaign 3 donations
      { campaign_id: campaignIds[2], donor_name: 'Tech Corp Morocco', donor_email: 'contact@techcorp.ma', amount: 10000, donor_message: 'We support AI innovation in Morocco!' },
      { campaign_id: campaignIds[2], donor_name: 'Amine Tazi', donor_email: 'amine.t@example.com', amount: 3000, donor_message: 'MIT is an amazing opportunity. Make us proud!' },
      { campaign_id: campaignIds[2], donor_name: 'Sophia Chen', donor_email: 'sophia@example.com', amount: 2800, donor_message: 'AI is the future. Good luck with your research!' },

      // Campaign 4 donations
      { campaign_id: campaignIds[3], donor_name: 'Entrepreneurs Club', donor_email: 'info@entrepreneurs.ma', amount: 15000, donor_message: 'Future business leaders deserve support!' },
      { campaign_id: campaignIds[3], donor_name: 'Khalid Bennani', donor_email: 'khalid@example.com', amount: 5000, donor_message: 'Rural students are our future!' },
      { campaign_id: campaignIds[3], donor_name: 'Nour El Amrani', donor_email: 'nour@example.com', amount: 3200, donor_message: 'You inspire us all!' },
      { campaign_id: campaignIds[3], donor_name: 'Anonymous', is_anonymous: 1, amount: 8000, donor_message: 'Keep reaching for your dreams!' },

      // Campaign 5 donations
      { campaign_id: campaignIds[4], donor_name: 'Architects Society', donor_email: 'contact@architects.ma', amount: 8000, donor_message: 'Sustainable architecture is crucial for Morocco!' },
      { campaign_id: campaignIds[4], donor_name: 'Mehdi Fassi', donor_email: 'mehdi@example.com', amount: 4000, donor_message: 'Your project sounds amazing!' },
      { campaign_id: campaignIds[4], donor_name: 'Salma Idrissi', donor_email: 'salma@example.com', amount: 3900, donor_message: 'Can\'t wait to see your final design!' },
      { campaign_id: campaignIds[4], donor_name: 'Youssef Alami', donor_email: 'youssef.a@example.com', amount: 3000, donor_message: 'Good luck with the competition!' },

      // Campaign 6 donations
      { campaign_id: campaignIds[5], donor_name: 'Justice for All Foundation', donor_email: 'info@justice.ma', amount: 5000, donor_message: 'We need more lawyers fighting for social justice!' },
      { campaign_id: campaignIds[5], donor_name: 'Amina Berrada', donor_email: 'amina@example.com', amount: 2000, donor_message: 'Thank you for dedicating yourself to helping others!' },
      { campaign_id: campaignIds[5], donor_name: 'Karim Ziani', donor_email: 'karim.z@example.com', amount: 1500, donor_message: 'Small contribution for a big cause!' }
    ];

    for (const donation of donations) {
      await connection.query(
        `INSERT INTO donations (campaign_id, donor_name, donor_email, donor_message,
        is_anonymous, amount, currency, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          donation.campaign_id, donation.donor_name, donation.donor_email || null,
          donation.donor_message, donation.is_anonymous || 0, donation.amount,
          'MAD', 'completed'
        ]
      );
    }
    console.log('✓ Created', donations.length, 'donations');

    // Add comments
    console.log('\nCreating sample comments...');
    const comments = [
      { campaign_id: campaignIds[0], author_name: 'Hicham Alami', content: 'Your story is so inspiring! I graduated from ENSAM 5 years ago. If you need any advice or mentorship, feel free to reach out!' },
      { campaign_id: campaignIds[0], author_name: 'Nadia Tazi', content: 'Just donated! Keep pushing forward, you\'re almost there!' },
      { campaign_id: campaignIds[0], author_name: 'Omar Idrissi', content: 'Morocco needs more women in engineering. You\'re a role model!' },

      { campaign_id: campaignIds[1], author_name: 'Dr. Samira Bennani', content: 'As a practicing physician in Casablanca, I can tell you that your dedication to serving rural communities is exactly what Morocco needs. Best of luck!' },
      { campaign_id: campaignIds[1], author_name: 'Ahmed Fassi', content: 'My village in the Rif desperately needs doctors. Thank you for your commitment!' },
      { campaign_id: campaignIds[1], author_name: 'Fatima Zahraoui', content: 'Just shared your campaign with my network. Hope it helps!' },

      { campaign_id: campaignIds[2], author_name: 'Yassine Cherif', content: 'MIT is an incredible opportunity! Make sure to network with Moroccan alumni there.' },
      { campaign_id: campaignIds[2], author_name: 'Laila Amrani', content: 'Your research topic is fascinating. Will you publish your findings?' },

      { campaign_id: campaignIds[3], author_name: 'Khalid Bennani', content: 'Fellow AUI student here! Your determination is amazing. Let me know if you need any campus resources!' },
      { campaign_id: campaignIds[3], author_name: 'Sara Idrissi', content: 'Being first in your family to attend university is such an achievement. You should be proud!' },

      { campaign_id: campaignIds[4], author_name: 'Mohamed Tazi', content: 'Your sustainable housing project could revolutionize how we approach urban development in Morocco. Brilliant!' },
      { campaign_id: campaignIds[4], author_name: 'Amina Alaoui', content: 'Would love to see your final designs when they\'re ready!' },

      { campaign_id: campaignIds[5], author_name: 'Rachid Berrada', content: 'We need more lawyers committed to social justice. Thank you for choosing this path!' },
      { campaign_id: campaignIds[5], author_name: 'Zineb Fassi', content: 'Your passion for helping marginalized communities is evident. Best wishes!' }
    ];

    for (const comment of comments) {
      await connection.query(
        `INSERT INTO campaign_comments (campaign_id, author_name, content)
        VALUES (?, ?, ?)`,
        [comment.campaign_id, comment.author_name, comment.content]
      );
    }
    console.log('✓ Created', comments.length, 'comments');

    // Add campaign updates
    console.log('\nCreating sample campaign updates...');
    const updates = [
      {
        campaign_id: campaignIds[0],
        user_id: studentUser.id,
        title: 'Thank You for Your Support!',
        content: 'I am overwhelmed by the generosity and support from this amazing community! Thanks to your contributions, I\'ve been able to secure my textbooks for this semester and focus more on my studies. We\'re at 63% of our goal - every donation brings me closer to completing my engineering degree. I promise to make you all proud! 🙏'
      },
      {
        campaign_id: campaignIds[0],
        user_id: studentUser.id,
        title: 'Midterm Results',
        content: 'Just wanted to share some good news - I received excellent marks on my midterm exams! Your support has allowed me to concentrate fully on my studies without worrying about finances. Thank you for believing in me!'
      },
      {
        campaign_id: campaignIds[1],
        user_id: studentUser.id,
        title: 'Started Clinical Rotations',
        content: 'Thanks to your incredible support, I\'ve started my clinical rotations at CHU Ibn Sina. It\'s challenging but incredibly rewarding. Every day I\'m learning and growing as a future physician. We\'re at 70% of our goal - thank you all so much!'
      },
      {
        campaign_id: campaignIds[2],
        user_id: studentUser.id,
        title: 'MIT Acceptance Confirmed!',
        content: 'Amazing news! My acceptance to the MIT research program has been officially confirmed! I still need support for travel and accommodation, but this is a huge step forward. Thank you to everyone who has contributed so far!'
      },
      {
        campaign_id: campaignIds[3],
        user_id: studentUser.id,
        title: 'Just 82% to Go!',
        content: 'We\'re so close! Thanks to your support, I\'ve secured my tuition for this semester. The remaining funds will help with living expenses and course materials. Every contribution makes a difference!'
      }
    ];

    for (const update of updates) {
      await connection.query(
        `INSERT INTO campaign_updates (campaign_id, user_id, title, content)
        VALUES (?, ?, ?, ?)`,
        [update.campaign_id, update.user_id, update.title, update.content]
      );
    }
    console.log('✓ Created', updates.length, 'campaign updates');

    // Add campaign metrics
    console.log('\nCreating campaign metrics...');
    for (let i = 0; i < campaignIds.length; i++) {
      const views = Math.floor(Math.random() * 2000) + 500;
      const shares = Math.floor(Math.random() * 150) + 20;
      await connection.query(
        `INSERT INTO campaign_metrics (campaign_id, view_count, share_count, updates_posted)
        VALUES (?, ?, ?, ?)`,
        [campaignIds[i], views, shares, i < 5 ? 2 : 1]
      );
    }
    console.log('✓ Created metrics for', campaignIds.length, 'campaigns');

    // Add some favorites
    console.log('\nCreating user favorites...');
    if (donorUser) {
      for (let i = 0; i < 3; i++) {
        await connection.query(
          `INSERT INTO favorites (user_id, campaign_id) VALUES (?, ?)`,
          [donorUser.id, campaignIds[i]]
        );
      }
      console.log('✓ Created favorites');
    }

    await connection.end();

    console.log('\n========================================');
    console.log('✓ Sample data created successfully!');
    console.log('========================================');
    console.log('\nSummary:');
    console.log('  • Campaigns:', campaignIds.length);
    console.log('  • Donations:', donations.length);
    console.log('  • Comments:', comments.length);
    console.log('  • Updates:', updates.length);
    console.log('  • Metrics: Added for all campaigns');
    console.log('\nYour database is now ready for testing! 🎉');

  } catch (err) {
    console.error('✗ Error:', err.message);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}

seedData();
