const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function test() {
  try {
    console.log('Testing /api/v1/academy/courses');
    const coursesRes = await get('http://localhost:8000/api/v1/academy/courses');
    if (!coursesRes.success || !coursesRes.data || coursesRes.data.length === 0) {
      console.error('FAILED: Courses empty or failed', coursesRes);
      return;
    }
    console.log(`Found ${coursesRes.data.length} courses`);
    const course1 = coursesRes.data[0];
    console.log('First Course:', course1.title);
    console.log('Lessons count:', course1.lessons);
    console.log('Difficulty:', course1.difficulty);

    console.log('\nTesting /api/v1/academy/courses/' + course1.id);
    const detailRes = await get(`http://localhost:8000/api/v1/academy/courses/${course1.id}`);
    if (!detailRes.success || !detailRes.data.modules) {
      console.error('FAILED: Course detail missing modules');
      return;
    }
    const modules = detailRes.data.modules;
    console.log(`Found ${modules.length} modules`);
    console.log('First module:', modules[0].title);
    console.log('Module 1 lessons:', modules[0].lessons.length);
    console.log('First lesson title:', modules[0].lessons[0].title);
    console.log('First lesson intro:', modules[0].lessons[0].content.introduction);
    
    console.log('\nALL TESTS PASSED!');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
