const staffData = [
  {
    "id": "1",
    "imageUrl": "/mona.jpeg",
    "userName": "Sarah Johnson",
    "jobTitle": "CEO"
  },
  {
    "id": "2",
    "imageUrl": "https://images.pexels.com/photos/5247132/pexels-photo-5247132.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
    "userName": "Michael Chen",
    "jobTitle": "CTO"
  },
  {
    "id": "3",
    "imageUrl": "https://foo.com",
    "userName": "Emily Rodriguez",
    "jobTitle": "Head of Design"
  },
  {
    "id": "4",
    "imageUrl": "https://images.pexels.com/photos/789822/pexels-photo-789822.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
    "userName": "David Kim",
    "jobTitle": "Lead Developer"
  }
] ; localStorage.setItem('stff-board', JSON.stringify(staffData));
