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
  layoutMode: 'standard' | 'minimal';
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
  { id: 'itv2', name: 'ITV2', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/ITV2_logo_2023.svg/1200px-ITV2_logo_2023.svg.png', number: 6 },
  { id: 'itv3', name: 'ITV3', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/ITV3_logo_2023.svg/1200px-ITV3_logo_2023.svg.png', number: 10 },
  { id: 'itv4', name: 'ITV4', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/ITV4_logo_2023.svg/1200px-ITV4_logo_2023.svg.png', number: 24 },
  { id: 'itvbe', name: 'ITVBe', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/ITVBe_logo_2023.svg/1200px-ITVBe_logo_2023.svg.png', number: 26 },
  { id: 'more4', name: 'More4', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/More4_logo_2015.svg/1200px-More4_logo_2015.svg.png', number: 18 },
  { id: '4seven', name: '4seven', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/4seven_logo_2012.svg/1200px-4seven_logo_2012.svg.png', number: 47 },
  { id: 'sky-news', name: 'Sky News', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sky_News_logo_2020.svg/1200px-Sky_News_logo_2020.svg.png', number: 233 },
  { id: 'bbc-news', name: 'BBC News', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BBC_News_logo_2021.svg/1200px-BBC_News_logo_2021.svg.png', number: 231 },
  { id: 'dave', name: 'Dave', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Dave_logo_2022.svg/1200px-Dave_logo_2022.svg.png', number: 19 },
  { id: 'yesterday', name: 'Yesterday', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Yesterday_logo_2022.svg/1200px-Yesterday_logo_2022.svg.png', number: 27 },
  { id: 'drama', name: 'Drama', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Drama_logo_2022.svg/1200px-Drama_logo_2022.svg.png', number: 20 },
  { id: 'w', name: 'W', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/W_logo_2022.svg/1200px-W_logo_2022.svg.png', number: 25 },
  { id: 'quest', name: 'Quest', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Quest_logo_2018.svg/1200px-Quest_logo_2018.svg.png', number: 12 },
  { id: 'quest-red', name: 'Quest Red', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Quest_Red_logo_2018.svg/1200px-Quest_Red_logo_2018.svg.png', number: 38 },
  { id: 'really', name: 'Really', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Really_logo_2022.svg/1200px-Really_logo_2022.svg.png', number: 17 },
  { id: 'food-network', name: 'Food Network', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Food_Network_logo_2016.svg/1200px-Food_Network_logo_2016.svg.png', number: 41 },
  { id: 'hgtv', name: 'HGTV', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/HGTV_logo_2016.svg/1200px-HGTV_logo_2016.svg.png', number: 42 },
  { id: 'dmax', name: 'DMAX', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/DMAX_logo_2018.svg/1200px-DMAX_logo_2018.svg.png', number: 37 },
  { id: 'smithsonian', name: 'Smithsonian', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Smithsonian_Channel_logo_2018.svg/1200px-Smithsonian_Channel_logo_2018.svg.png', number: 57 },
  { id: 'pbs-america', name: 'PBS America', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/PBS_America_logo_2011.svg/1200px-PBS_America_logo_2011.svg.png', number: 84 },
  { id: 'talking-pictures', name: 'Talking Pictures', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Talking_Pictures_TV_logo_2015.svg/1200px-Talking_Pictures_TV_logo_2015.svg.png', number: 81 },
  { id: 'horrors', name: 'HorrorXtra', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/HorrorXtra_logo_2022.svg/1200px-HorrorXtra_logo_2022.svg.png', number: 68 },
  { id: 'cbs-reality', name: 'CBS Reality', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/CBS_Reality_logo_2022.svg/1200px-CBS_Reality_logo_2022.svg.png', number: 66 },
  { id: 'legend', name: 'Legend', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Legend_logo_2022.svg/1200px-Legend_logo_2022.svg.png', number: 41 },
  { id: 'great-movies', name: 'Great! Movies', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Great_Movies_logo_2021.svg/1200px-Great_Movies_logo_2021.svg.png', number: 33 },
  { id: 'great-action', name: 'Great! Action', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Great_Action_logo_2021.svg/1200px-Great_Action_logo_2021.svg.png', number: 42 },
  { id: 'great-romance', name: 'Great! Romance', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Great_Romance_logo_2021.svg/1200px-Great_Romance_logo_2021.svg.png', number: 49 },
  { id: 'pop', name: 'POP', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/POP_logo_2017.svg/1200px-POP_logo_2017.svg.png', number: 206 },
  { id: 'tiny-pop', name: 'Tiny Pop', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Tiny_Pop_logo_2017.svg/1200px-Tiny_Pop_logo_2017.svg.png', number: 207 },
  { id: 'cbeebies', name: 'CBeebies', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/CBeebies_logo_2021.svg/1200px-CBeebies_logo_2021.svg.png', number: 202 },
  { id: 'cbbc', name: 'CBBC', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/CBBC_logo_2021.svg/1200px-CBBC_logo_2021.svg.png', number: 201 },
  { id: 'citv', name: 'CITV', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/CITV_logo_2023.svg/1200px-CITV_logo_2023.svg.png', number: 203 },
  { id: 'pop-max', name: 'POP Max', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/POP_Max_logo_2017.svg/1200px-POP_Max_logo_2017.svg.png', number: 208 },
  { id: 'sony-movies', name: 'Sony Movies', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Sony_Movies_logo_2019.svg/1200px-Sony_Movies_logo_2019.svg.png', number: 32 },
  { id: 'sony-action', name: 'Sony Action', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Sony_Action_logo_2019.svg/1200px-Sony_Action_logo_2019.svg.png', number: 40 },
  { id: 'sony-classic', name: 'Sony Classic', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Sony_Classic_logo_2019.svg/1200px-Sony_Classic_logo_2019.svg.png', number: 50 },
  { id: 'tbn-uk', name: 'TBN UK', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/TBN_UK_logo_2015.svg/1200px-TBN_UK_logo_2015.svg.png', number: 65 },
  { id: 'god-tv', name: 'GOD TV', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/GOD_TV_logo_2016.svg/1200px-GOD_TV_logo_2016.svg.png', number: 67 },
  { id: 'daystar', name: 'Daystar', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Daystar_logo_2015.svg/1200px-Daystar_logo_2015.svg.png', number: 73 },
  { id: 'rt-news', name: 'RT News', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/RT_logo_2015.svg/1200px-RT_logo_2015.svg.png', number: 234 },
  { id: 'al-jazeera', name: 'Al Jazeera', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Al_Jazeera_logo_2015.svg/1200px-Al_Jazeera_logo_2015.svg.png', number: 235 },
  { id: 'euronews', name: 'Euronews', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Euronews_logo_2016.svg/1200px-Euronews_logo_2016.svg.png', number: 236 },
  { id: 'france24', name: 'France 24', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/France_24_logo_2013.svg/1200px-France_24_logo_2013.svg.png', number: 237 },
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
