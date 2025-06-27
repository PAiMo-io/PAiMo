export interface PlacementOption {
  value: string
  labelKey: string
  score: number
}

export interface PlacementQuestion {
  key: string
  questionKey: string
  options: PlacementOption[]
}

export interface PlacementPart {
  key: string
  titleKey: string
  weight: number
  multiplier: number
  questions: PlacementQuestion[]
}

export const PLACEMENT_PARTS: PlacementPart[] = [
  {
    key: 'A',
    titleKey: 'partA',
    weight: 1,
    multiplier: 1,
    questions: [
      {
        key: 'experience',
        questionKey: 'placementExperience',
        options: [
          { value: 'less', labelKey: 'placementExperience.lessThanYear', score: 1 },
          { value: 'mid', labelKey: 'placementExperience.oneToThree', score: 3 },
          { value: 'more', labelKey: 'placementExperience.moreThanThree', score: 5 },
        ],
      },
      {
        key: 'frequency',
        questionKey: 'placementFrequency',
        options: [
          { value: 'rarely', labelKey: 'placementFrequency.rarely', score: 1 },
          { value: 'sometimes', labelKey: 'placementFrequency.sometimes', score: 2 },
          { value: 'often', labelKey: 'placementFrequency.often', score: 3 },
        ],
      },
    ],
  },
  {
    key: 'B',
    titleKey: 'partB',
    weight: 1,
    multiplier: 1,
    questions: [
      {
        key: 'jumpSmash',
        questionKey: 'placementJumpSmash',
        options: [
          { value: 'yes', labelKey: 'placementJumpSmash.yes', score: 2 },
          { value: 'no', labelKey: 'placementJumpSmash.no', score: 0 },
        ],
      },
    ],
  },
]
