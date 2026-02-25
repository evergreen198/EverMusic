export type InstrumentId =
  | 'piano'
  | 'guitar'
  | 'bass'
  | 'drum'
  | 'string'
  | '管乐'
  | '打击乐';

// 每种乐器的采样配置（目前只精细配置了钢琴和吉他，其他先复用钢琴）
export const instrumentSampleConfigs: Record<
  InstrumentId,
  { baseUrl: string; urls: Record<string, string> }
> = {
  piano: {
    baseUrl: '/materials/piano/',
    urls: {
      C4: 'C4vL.mp3',
      A4: 'A4vH.mp3',
    },
  },
  guitar: {
    baseUrl: '/materials/guitar/',
    urls: {
      C4: 'C4.mp3',
      A4: 'A4.mp3',
    },
  },
  bass: {
    baseUrl: '/materials/piano/',
    urls: {
      C4: 'C4.mp3',
      C3: 'C3.mp3',//问题
    },
  },
  drum: {
    baseUrl: '/materials/piano/',
    urls: {
      C4: 'C4vL.mp3',
      A4: 'A4vH.mp3',
    },
  },
  string: {
    baseUrl: '/materials/piano/',
    urls: {
      C4: 'C4vL.mp3',
      A4: 'A4vH.mp3',
    },
  },
  管乐: {
    baseUrl: '/materials/piano/',
    urls: {
      C4: 'C4vL.mp3',
      A4: 'A4vH.mp3',
    },
  },
  打击乐: {
    baseUrl: '/materials/piano/',
    urls: {
      C4: 'C4vL.mp3',
      A4: 'A4vH.mp3',
    },
  },
};

