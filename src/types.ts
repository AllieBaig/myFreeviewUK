import { format, addMinutes, startOfHour, addHours } from 'date-fns';

export interface Programme {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  genre: string;
  channelId: string;
  thumbnail?: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  number: number;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastCheckIn: string; // ISO string
  achievements: string[];
  uid: string;
}

export interface UserPreferences {
  favoriteChannels: string[];
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
}

const CHANNELS: Channel[] = [
  { id: 'bbcone', name: 'BBC One', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/BBC_One_2021.svg/1200px-BBC_One_2021.svg.png', number: 1 },
  { id: 'bbctwo', name: 'BBC Two', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BBC_Two_2021.svg/1200px-BBC_Two_2021.svg.png', number: 2 },
  { id: 'itv1', name: 'ITV1', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/ITV_logo_2023.svg/1200px-ITV_logo_2023.svg.png', number: 3 },
  { id: 'channel4', name: 'Channel 4', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Channel_4_logo_2015.svg/1200px-Channel_4_logo_2015.svg.png', number: 4 },
  { id: 'channel5', name: 'Channel 5', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Channel_5_logo_2016.svg/1200px-Channel_5_logo_2016.svg.png', number: 5 },
  { id: 'skyarts', name: 'Sky Arts', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Sky_Arts_logo_2020.svg/1200px-Sky_Arts_logo_2020.svg.png', number: 11 },
  { id: 'e4', name: 'E4', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/E4_logo_2018.svg/1200px-E4_logo_2018.svg.png', number: 13 },
  { id: 'film4', name: 'Film4', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Film4_logo_2016.svg/1200px-Film4_logo_2016.svg.png', number: 14 },
];

const SHOW_TITLES = [
  'Morning News', 'The Great Bake Off', 'Mystery in the Alps', 'Space Explorers',
  'Cooking with Fire', 'The Daily Show', 'Wildlife Wonders', 'Tech Today',
  'Classic Cinema', 'Sports Roundup', 'The Voice of the Nation', 'Late Night Talk'
];

const GENRES = ['News', 'Reality', 'Drama', 'Documentary', 'Comedy', 'Movies', 'Sports'];

export const generateMockSchedule = (date: Date = new Date()): Programme[] => {
  const programmes: Programme[] = [];
  const start = startOfHour(date);

  CHANNELS.forEach(channel => {
    let currentTime = start;
    // Generate 24 hours of programming
    for (let i = 0; i < 24; i++) {
      const duration = [30, 60, 90, 120][Math.floor(Math.random() * 4)];
      const endTime = addMinutes(currentTime, duration);
      
      programmes.push({
        id: `${channel.id}-${currentTime.getTime()}`,
        channelId: channel.id,
        title: SHOW_TITLES[Math.floor(Math.random() * SHOW_TITLES.length)],
        description: 'A fascinating programme that you won\'t want to miss. Tune in for excitement and entertainment.',
        startTime: currentTime.toISOString(),
        endTime: endTime.toISOString(),
        genre: GENRES[Math.floor(Math.random() * GENRES.length)],
        thumbnail: `https://picsum.photos/seed/${channel.id}-${i}/400/225`
      });

      currentTime = endTime;
      if (currentTime > addHours(start, 24)) break;
    }
  });

  return programmes;
};

export { CHANNELS };
