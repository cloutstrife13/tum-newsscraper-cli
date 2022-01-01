import { Label } from './enums'

export const singleTextLabels: string[] = [
  Label.Author,
  Label.Heading,
  Label.PubDate,
  Label.Standfirst,
  Label.Subheading,
]

export const multiTextLabels: string[] = [Label.Categories, Label.Tags]

export const bodyExtractionLabels: string[] = [Label.Body, Label.BodyExclusion]
