export interface Question {
  id: string
  question: string
  type: 'multiple_choice' | 'scale' | 'text' | 'checkbox'
  options?: string[]
  required: boolean
  category: 'bowel_habits' | 'symptoms' | 'lifestyle' | 'medical_history'
}

export interface AssessmentAnswer {
  question_id: string
  answer: any
}

export interface IBSClassification {
  ibs_type: 'IBS-C' | 'IBS-D' | 'IBS-M' | 'IBS-U'
  confidence: number
  reasoning: string
  recommendations: string[]
  severity: 'Mild' | 'Moderate' | 'Severe'
  score: number
}

export interface AssessmentResult {
  classification: IBSClassification
  completed_at: string
  next_steps: string[]
}

export const assessmentQuestions: Question[] = [
  // Bowel Habits
  {
    id: 'bowel_frequency',
    question: 'How many bowel movements do you typically have per week?',
    type: 'multiple_choice',
    options: ['Less than 3', '3-6', '7-14', '15-21', 'More than 21'],
    required: true,
    category: 'bowel_habits'
  },
  {
    id: 'stool_consistency',
    question: 'What best describes your typical stool consistency? (Based on Bristol Stool Chart)',
    type: 'multiple_choice',
    options: [
      'Type 1-2: Hard, lumpy (Constipation)',
      'Type 3-4: Normal formed stools',
      'Type 5-6: Soft, mushy stools',
      'Type 7: Watery, liquid (Diarrhea)',
      'Mixed types throughout the week'
    ],
    required: true,
    category: 'bowel_habits'
  },
  {
    id: 'urgency_frequency',
    question: 'How often do you experience urgency (sudden, strong need to have a bowel movement)?',
    type: 'multiple_choice',
    options: ['Never', 'Rarely (once a month)', 'Sometimes (weekly)', 'Often (multiple times per week)', 'Daily'],
    required: true,
    category: 'bowel_habits'
  },
  
  // Symptoms
  {
    id: 'abdominal_pain_frequency',
    question: 'How often do you experience abdominal pain or discomfort?',
    type: 'multiple_choice',
    options: ['Never', 'Less than once a month', 'Monthly', 'Weekly', 'Daily'],
    required: true,
    category: 'symptoms'
  },
  {
    id: 'abdominal_pain_severity',
    question: 'When you do experience abdominal pain, how severe is it typically?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    required: true,
    category: 'symptoms'
  },
  {
    id: 'bloating_frequency',
    question: 'How often do you experience bloating or abdominal distension?',
    type: 'multiple_choice',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    required: true,
    category: 'symptoms'
  },
  {
    id: 'gas_frequency',
    question: 'How often do you experience excessive gas or flatulence?',
    type: 'multiple_choice',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    required: true,
    category: 'symptoms'
  },
  {
    id: 'mucus_stool',
    question: 'Do you notice mucus in your stool?',
    type: 'multiple_choice',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    required: true,
    category: 'symptoms'
  },
  
  // Triggers and Lifestyle
  {
    id: 'food_triggers',
    question: 'Which foods seem to trigger your symptoms? (Select all that apply)',
    type: 'checkbox',
    options: [
      'Dairy products',
      'Spicy foods',
      'Fatty/greasy foods',
      'High-fiber foods',
      'Caffeine',
      'Alcohol',
      'Artificial sweeteners',
      'Beans/legumes',
      'Cruciferous vegetables (broccoli, cabbage)',
      'None identified',
      'Other'
    ],
    required: true,
    category: 'lifestyle'
  },
  {
    id: 'stress_impact',
    question: 'How much does stress affect your IBS symptoms?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    required: true,
    category: 'lifestyle'
  },
  {
    id: 'exercise_frequency',
    question: 'How often do you engage in regular physical exercise?',
    type: 'multiple_choice',
    options: ['Never', '1-2 times per week', '3-4 times per week', '5-6 times per week', 'Daily'],
    required: true,
    category: 'lifestyle'
  },
  {
    id: 'sleep_quality',
    question: 'How would you rate your overall sleep quality?',
    type: 'multiple_choice',
    options: ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'],
    required: true,
    category: 'lifestyle'
  },
  
  // Medical History
  {
    id: 'symptom_duration',
    question: 'How long have you been experiencing these symptoms?',
    type: 'multiple_choice',
    options: ['Less than 3 months', '3-6 months', '6-12 months', '1-2 years', 'More than 2 years'],
    required: true,
    category: 'medical_history'
  },
  {
    id: 'family_history',
    question: 'Do you have a family history of IBS or other digestive disorders?',
    type: 'multiple_choice',
    options: ['No family history', 'IBS', 'IBD (Crohn\'s, Ulcerative Colitis)', 'Celiac Disease', 'Other digestive disorders', 'Unsure'],
    required: true,
    category: 'medical_history'
  },
  {
    id: 'current_medications',
    question: 'Are you currently taking any medications for digestive issues?',
    type: 'multiple_choice',
    options: ['No medications', 'Antispasmodics', 'Laxatives', 'Anti-diarrheal medications', 'Probiotics', 'Other'],
    required: true,
    category: 'medical_history'
  }
]

class AssessmentService {
  private calculateBowelHabitsScore(answers: Record<string, any>): { constipationScore: number, diarrheaScore: number } {
    let constipationScore = 0
    let diarrheaScore = 0

    // Bowel frequency scoring
    const frequency = answers['bowel_frequency']
    if (frequency === 'Less than 3') constipationScore += 3
    else if (frequency === '3-6') constipationScore += 2
    else if (frequency === '7-14') { /* normal, no points */ }
    else if (frequency === '15-21') diarrheaScore += 2
    else if (frequency === 'More than 21') diarrheaScore += 3

    // Stool consistency scoring
    const consistency = answers['stool_consistency']
    if (consistency?.includes('Type 1-2')) constipationScore += 3
    else if (consistency?.includes('Type 3-4')) { /* normal, no points */ }
    else if (consistency?.includes('Type 5-6')) diarrheaScore += 2
    else if (consistency?.includes('Type 7')) diarrheaScore += 3
    else if (consistency?.includes('Mixed types')) { /* mixed pattern */ }

    // Urgency scoring
    const urgency = answers['urgency_frequency']
    if (urgency === 'Often' || urgency === 'Daily') diarrheaScore += 2
    else if (urgency === 'Sometimes') diarrheaScore += 1

    return { constipationScore, diarrheaScore }
  }

  private calculateSymptomsScore(answers: Record<string, any>): number {
    let symptomsScore = 0

    // Abdominal pain frequency
    const painFreq = answers['abdominal_pain_frequency']
    if (painFreq === 'Daily') symptomsScore += 3
    else if (painFreq === 'Weekly') symptomsScore += 2
    else if (painFreq === 'Monthly') symptomsScore += 1

    // Abdominal pain severity
    const painSeverity = parseInt(answers['abdominal_pain_severity']) || 0
    if (painSeverity >= 8) symptomsScore += 3
    else if (painSeverity >= 6) symptomsScore += 2
    else if (painSeverity >= 4) symptomsScore += 1

    // Bloating
    const bloating = answers['bloating_frequency']
    if (bloating === 'Always' || bloating === 'Often') symptomsScore += 2
    else if (bloating === 'Sometimes') symptomsScore += 1

    // Gas
    const gas = answers['gas_frequency']
    if (gas === 'Always' || gas === 'Often') symptomsScore += 1

    return symptomsScore
  }

  private calculateLifestyleScore(answers: Record<string, any>): number {
    let lifestyleScore = 0

    // Stress impact
    const stress = parseInt(answers['stress_impact']) || 0
    if (stress >= 8) lifestyleScore += 3
    else if (stress >= 6) lifestyleScore += 2
    else if (stress >= 4) lifestyleScore += 1

    // Exercise frequency (protective factor)
    const exercise = answers['exercise_frequency']
    if (exercise === 'Never') lifestyleScore += 2
    else if (exercise === '1-2 times per week') lifestyleScore += 1

    // Sleep quality
    const sleep = answers['sleep_quality']
    if (sleep === 'Very poor' || sleep === 'Poor') lifestyleScore += 2
    else if (sleep === 'Fair') lifestyleScore += 1

    return lifestyleScore
  }

  private generateRecommendations(classification: string, answers: Record<string, any>): string[] {
    const recommendations: string[] = []

    // Base recommendations for all IBS types
    recommendations.push('Keep a detailed symptom and food diary to identify personal triggers')
    recommendations.push('Maintain regular meal times and eat slowly')
    recommendations.push('Stay adequately hydrated throughout the day')

    // Type-specific recommendations
    if (classification === 'IBS-C') {
      recommendations.push('Gradually increase fiber intake with soluble fiber sources')
      recommendations.push('Consider probiotics to support gut health')
      recommendations.push('Engage in regular physical activity to promote bowel movements')
      recommendations.push('Discuss with your doctor about appropriate laxatives if needed')
    } else if (classification === 'IBS-D') {
      recommendations.push('Consider a low-FODMAP diet under professional guidance')
      recommendations.push('Limit caffeine and alcohol intake')
      recommendations.push('Avoid artificial sweeteners and sugar alcohols')
      recommendations.push('Consider anti-diarrheal medications as recommended by your healthcare provider')
    } else if (classification === 'IBS-M') {
      recommendations.push('Work with a registered dietitian familiar with IBS management')
      recommendations.push('Consider the low-FODMAP diet elimination and reintroduction phases')
      recommendations.push('Track symptoms carefully to identify patterns')
      recommendations.push('Discuss combination therapy options with your healthcare provider')
    }

    // Stress-related recommendations
    const stressScore = parseInt(answers['stress_impact']) || 0
    if (stressScore >= 6) {
      recommendations.push('Practice stress management techniques such as meditation or deep breathing')
      recommendations.push('Consider counseling or cognitive behavioral therapy')
      recommendations.push('Establish a regular sleep schedule and practice good sleep hygiene')
    }

    // Exercise recommendations
    const exercise = answers['exercise_frequency']
    if (exercise === 'Never' || exercise === '1-2 times per week') {
      recommendations.push('Gradually increase physical activity - aim for 30 minutes of moderate exercise most days')
    }

    return recommendations
  }

  private generateNextSteps(classification: string, severity: string): string[] {
    const steps: string[] = []

    if (severity === 'Severe') {
      steps.push('Schedule an appointment with a gastroenterologist for comprehensive evaluation')
      steps.push('Request laboratory tests to rule out other conditions')
    } else {
      steps.push('Discuss your symptoms with your primary care physician')
    }

    steps.push('Begin tracking your daily symptoms, food intake, and bowel movements')
    steps.push('Start implementing dietary recommendations gradually')
    steps.push('Set up daily reminder notifications for symptom tracking')
    
    if (classification !== 'IBS-U') {
      steps.push('Consider consultation with a registered dietitian specializing in IBS')
    }

    steps.push('Follow up on your progress in 4-6 weeks')

    return steps
  }

  assessAnswers(answers: Record<string, any>): AssessmentResult {
    // Calculate scores for different aspects
    const { constipationScore, diarrheaScore } = this.calculateBowelHabitsScore(answers)
    const symptomsScore = this.calculateSymptomsScore(answers)
    const lifestyleScore = this.calculateLifestyleScore(answers)

    // Determine IBS type based on bowel habit scores
    let ibsType: 'IBS-C' | 'IBS-D' | 'IBS-M' | 'IBS-U'
    let reasoning: string
    let confidence: number

    const totalBowelScore = constipationScore + diarrheaScore
    const scoreDifference = Math.abs(constipationScore - diarrheaScore)

    if (totalBowelScore === 0) {
      ibsType = 'IBS-U'
      reasoning = 'Your symptoms are not clearly characteristic of a specific IBS subtype. Further evaluation may be needed.'
      confidence = 0.6
    } else if (constipationScore > diarrheaScore && scoreDifference >= 2) {
      ibsType = 'IBS-C'
      reasoning = 'Your symptoms indicate IBS with constipation (IBS-C). You experience primarily hard stools and infrequent bowel movements.'
      confidence = 0.8 + (scoreDifference * 0.05)
    } else if (diarrheaScore > constipationScore && scoreDifference >= 2) {
      ibsType = 'IBS-D'
      reasoning = 'Your symptoms indicate IBS with diarrhea (IBS-D). You experience primarily loose stools and frequent bowel movements.'
      confidence = 0.8 + (scoreDifference * 0.05)
    } else {
      ibsType = 'IBS-M'
      reasoning = 'Your symptoms indicate IBS with mixed bowel habits (IBS-M). You experience both constipation and diarrhea episodes.'
      confidence = 0.75
    }

    // Calculate overall severity
    const totalScore = symptomsScore + lifestyleScore + Math.max(constipationScore, diarrheaScore)
    let severity: 'Mild' | 'Moderate' | 'Severe'
    
    if (totalScore <= 4) severity = 'Mild'
    else if (totalScore <= 8) severity = 'Moderate'
    else severity = 'Severe'

    // Adjust confidence based on symptom clarity
    if (symptomsScore >= 6) confidence = Math.min(confidence + 0.1, 0.95)

    const recommendations = this.generateRecommendations(ibsType, answers)
    const nextSteps = this.generateNextSteps(ibsType, severity)

    return {
      classification: {
        ibs_type: ibsType,
        confidence: Math.round(confidence * 100) / 100,
        reasoning,
        recommendations,
        severity,
        score: totalScore
      },
      completed_at: new Date().toISOString(),
      next_steps: nextSteps
    }
  }
}

export const assessmentService = new AssessmentService()
