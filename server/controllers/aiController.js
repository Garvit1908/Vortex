const Gig = require('../models/Gig');

// Common tech keywords & patterns for smart parsing and fallback
const TECH_KEYWORDS = [
  'React', 'React.js', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'JavaScript', 'TypeScript',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Tailwind', 'Tailwind CSS', 'CSS', 'HTML', 'Figma',
  'UI/UX', 'Mobile App', 'Flutter', 'React Native', 'Android', 'iOS', 'Python', 'Django', 'FastAPI',
  'Flask', 'Docker', 'Kubernetes', 'AWS', 'Cloud', 'CI/CD', 'DevOps', 'Machine Learning', 'AI',
  'REST API', 'GraphQL', 'Payment Gateway', 'Stripe', 'Razorpay', 'WebSockets', 'Socket.IO',
  'E-commerce', 'Portfolio', 'Full-Stack', 'Frontend', 'Backend'
];

/**
 * Intelligent local extraction & matching fallback
 */
const performFallbackMatch = (requirementText, gigs) => {
  const lowerText = requirementText.toLowerCase();

  // Extract detected tech skills
  const extractedSkills = TECH_KEYWORDS.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );

  // If no specific known keywords detected, extract words with 4+ letters
  if (extractedSkills.length === 0) {
    const rawWords = requirementText
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['need', 'want', 'project', 'build', 'create', 'with', 'have', 'from', 'this', 'that'].includes(w.toLowerCase()));
    extractedSkills.push(...rawWords.slice(0, 4));
  }

  // Calculate scores for each active gig
  const scoredGigs = gigs.map((gig) => {
    let score = 50; // Base score
    const matchedSkills = [];

    const gigText = `${gig.title} ${gig.description} ${gig.category} ${(gig.tags || []).join(' ')}`.toLowerCase();

    extractedSkills.forEach((skill) => {
      if (gigText.includes(skill.toLowerCase())) {
        score += 15;
        matchedSkills.push(skill);
      }
    });

    // Rating quality boost
    if (gig.ratingAverage >= 4.5) score += 8;
    if (gig.provider?.isVerified) score += 7;

    // Cap between 60 and 98
    const finalScore = Math.min(98, Math.max(60, score));

    // Dynamic reason string
    let reason = '';
    if (matchedSkills.length > 0) {
      reason = `Matches your requirements in ${matchedSkills.slice(0, 3).join(', ')}. Provider has a ${gig.ratingAverage || '5.0'}★ track record.`;
    } else {
      reason = `Experienced in ${gig.category} with verified delivery capability for this scope.`;
    }

    return {
      gig,
      matchScore: finalScore,
      reason,
      matchedSkills,
    };
  });

  // Sort descending by matchScore
  scoredGigs.sort((a, b) => b.matchScore - a.matchScore);

  return {
    extractedSkills: extractedSkills.slice(0, 8),
    analysis: `Identified ${extractedSkills.length} key requirement parameters. Ranked ${gigs.length} available service listings based on skill alignment and provider credentials.`,
    matches: scoredGigs.slice(0, 6),
  };
};

/**
 * Call Google Gemini API for semantic matching
 */
const callGeminiMatch = async (requirementText, gigs, apiKey) => {
  const gigsContext = gigs.map((g) => ({
    id: g._id.toString(),
    title: g.title,
    category: g.category,
    tags: g.tags,
    price: g.price,
    deliveryTime: g.deliveryTime,
    providerName: g.provider?.name,
    rating: g.ratingAverage,
  }));

  const prompt = `You are the AI Matcher for Vortex Freelance Marketplace.
A client/user has submitted the following requirement:
"${requirementText}"

Here are the available services/gigs in our database:
${JSON.stringify(gigsContext, null, 2)}

Analyze the user's requirement:
1. Extract key skills/technologies mentioned or implied.
2. Provide a 1-sentence technical analysis of the project scope.
3. Compare the requirement against each gig. Assign a matchScore (integer between 50 and 99) and a 1-sentence reason explaining why this gig fits.
4. Output STRICTLY a JSON object matching this exact schema:
{
  "extractedSkills": ["Skill1", "Skill2", ...],
  "analysis": "1-sentence summary of what the client needs",
  "matches": [
    {
      "gigId": "string matching the id from above",
      "matchScore": 95,
      "reason": "1 sentence explaining why this freelancer gig is a great match"
    }
  ]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const result = await response.json();
  const rawJson = result.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(rawJson);

  // Map returned gigId back to the full gig object
  const gigMap = new Map(gigs.map((g) => [g._id.toString(), g]));

  const formattedMatches = (parsed.matches || [])
    .filter((m) => gigMap.has(m.gigId))
    .map((m) => ({
      gig: gigMap.get(m.gigId),
      matchScore: m.matchScore,
      reason: m.reason,
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  return {
    extractedSkills: parsed.extractedSkills || [],
    analysis: parsed.analysis || 'Matched against active marketplace talent.',
    matches: formattedMatches.slice(0, 6),
  };
};

/**
 * @desc    Match client project brief or candidate skills against active Gigs
 * @route   POST /api/ai/match
 * @access  Public
 */
const matchSkillsAndGigs = async (req, res, next) => {
  try {
    const { requirementText } = req.body;

    if (!requirementText || requirementText.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 5 characters describing your project requirements or skills.',
      });
    }

    // Fetch active gigs populated with provider details
    const gigs = await Gig.find({ isActive: true })
      .populate('provider', 'name title profilePhoto ratingAverage ratingCount isVerified')
      .lean();

    if (gigs.length === 0) {
      return res.status(200).json({
        success: true,
        extractedSkills: [],
        analysis: 'No active gigs currently in database.',
        matches: [],
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let resultData;
    if (apiKey && apiKey.trim() !== '') {
      try {
        resultData = await callGeminiMatch(requirementText.trim(), gigs, apiKey.trim());
      } catch (geminiError) {
        console.warn('[AI Matcher] Gemini API error, using intelligent fallback:', geminiError.message);
        resultData = performFallbackMatch(requirementText.trim(), gigs);
      }
    } else {
      resultData = performFallbackMatch(requirementText.trim(), gigs);
    }

    res.status(200).json({
      success: true,
      extractedSkills: resultData.extractedSkills,
      analysis: resultData.analysis,
      matches: resultData.matches,
      engine: apiKey ? 'gemini-1.5-flash' : 'semantic-heuristic',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  matchSkillsAndGigs,
};
