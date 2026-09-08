// ============================================================
//  AI Engine — Robust Classification, Priority,
// Sentiment, Input Validation, and Safe Response Generator
// ============================================================

class AI {
  constructor() {
    this.categories = {
      'Shipping': {
        keywords: {
          'hasn\'t arrived': 5, 'lost package': 5, 'tracking number': 4, 'not delivered': 4,
          'ship': 1, 'deliver': 1, 'package': 1, 'arrive': 1, 'transit': 2, 'courier': 2,
          'in transit': 3, 'where is my order': 5, 'shipping status': 4, 'delayed': 3,
          'kab aayega': 4, 'delivery date': 3, 'wrong address': 4, 'customs': 3
        },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for reaching out regarding Order {Order}. I have reviewed your shipping records. If you have a tracking number, please check the carrier site for real-time updates. If your shipment is past the expected window, please confirm your delivery address so we can investigate further.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe appreciate you contacting us about Order {Order}. Our logistics team is monitoring carrier updates. If your order has not arrived within the standard delivery window, please provide your current shipping details so an agent can assist.\n\nSincerely,\n{StoreName} Team"
          ],
          friendly: [
            "Hi {Name}!\n\nThanks for checking in on Order {Order}! I checked our shipping updates and your order is being handled by our carrier. If it seems delayed or you haven't received tracking details yet, let us know and we'll gladly double-check for you!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nThanks for reaching out! We know waiting for Order {Order} is top of mind. Please check your tracking link for the latest courier update, or reply here if you need us to look into it for you!\n\nBest,\n{StoreName} Support"
          ],
          empathetic: [
            "Hi {Name},\n\nI completely understand how stressful waiting for Order {Order} can be! We want to make sure your item reaches you safely. Please confirm your delivery address if you'd like an agent to verify the shipment status directly with the carrier.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI'm so sorry for any concern regarding Order {Order}. We track all shipments closely. If there's any delay or missing tracking info, please reply with your details and we will take immediate care of it.\n\nBest wishes,\n{StoreName} Team"
          ]
        }
      },
      'Billing': {
        keywords: {
          'charged twice': 5, 'duplicate charge': 5, 'double charge': 4, 'credit card statement': 3,
          'overcharged': 4, 'wrong amount': 4, 'charge': 1, 'refund': 2, 'payment': 2, 'invoice': 2,
          'receipt': 2, 'billing': 2, 'payment failed': 4, 'paise': 3, 'dobara charge': 4, 'unauthorized charge': 5
        },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for contacting us regarding the billing inquiry for Order {Order}. We take payment security seriously. Our finance team will review the transaction history. If an discrepancy is confirmed, any required adjustment will be processed promptly.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe have received your message regarding payment for Order {Order}. Please note that duplicate authorization holds typically release within 3-5 business days. If you see a settled extra charge, please share a screenshot of your bank statement for verification.\n\nSincerely,\n{StoreName} Team"
          ],
          friendly: [
            "Hi {Name}!\n\nThanks for letting us know about this billing question for Order {Order}. We're having our finance team review the transaction details right now to ensure everything is accurate.\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nI saw your note regarding payment for Order {Order}. Don't worry, we'll double-check our records and make sure any billing mix-up gets sorted out quickly!\n\nBest,\n{StoreName} Support"
          ],
          empathetic: [
            "Hi {Name},\n\nI completely understand your concern regarding charges for Order {Order}. Dealing with payment issues is never pleasant. We are reviewing this transaction carefully to ensure your account is handled correctly.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI apologize for any worry this billing question has caused. Please rest assured that our team will review the charge for Order {Order} and rectify any error immediately.\n\nBest wishes,\n{StoreName} Team"
          ]
        }
      },
      'Return/Refund': {
        keywords: {
          'wrong size': 5, 'wrong item': 5, 'wrong color': 4, 'doesn\'t fit': 4, 'send back': 3,
          'return label': 4, 'return': 2, 'exchange': 3, 'damaged': 3, 'broken': 3, 'defective': 4,
          'wapas': 3, 'refund money': 4, 'store credit': 3
        },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for reaching out regarding Order {Order}. We facilitate returns and exchanges within our standard policy window. Please confirm the condition of the item and whether you prefer an exchange or store credit so an agent can provide return instructions.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe have received your request for Order {Order}. To initiate a return, please ensure items are unused with original tags intact. Reply with your preferred resolution so we can assist you.\n\nSincerely,\n{StoreName} Team"
          ],
          friendly: [
            "Hi {Name}!\n\nNo problem at all! We'd be happy to help you with a return or exchange for Order {Order}. Just let us know what size or item you'd prefer instead, and we'll guide you through the quick steps!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nThanks for letting us know about Order {Order}. We want you to love your purchase! Reply back with your preference and we'll help get your return processed smoothly.\n\nBest,\n{StoreName} Support"
          ],
          empathetic: [
            "Hi {Name},\n\nI'm so sorry that Order {Order} didn't turn out as expected! I know how disappointing that can be. Please reply with details on whether you'd like a replacement or return, and we'll take care of it right away.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI apologize that your item from Order {Order} wasn't perfect. We want to make this right for you. Please let us know if you prefer a replacement or refund so an agent can handle your request.\n\nBest wishes,\n{StoreName} Team"
          ]
        }
      },
      'Product Question': {
        keywords: {
          'does it come in': 4, 'available in': 3, 'quick question': 3, 'compatible with': 4,
          'how to use': 4, 'size guide': 4, 'size': 1, 'color': 1, 'material': 2, 'warranty': 3,
          'specifications': 3, 'features': 2, 'restock': 3, 'in stock': 3, 'ingredients': 3
        },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for your product inquiry. Full specifications and sizing guides are available on our official store page. If you have a specific technical question, please let us know so we can assist.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe appreciate your interest in our products. Regarding your question about availability and features, please check our online catalog or reply with specific product model details.\n\nSincerely,\n{StoreName} Team"
          ],
          friendly: [
            "Hi {Name}!\n\nThanks for asking! That's a great question about our products. You can view all available colors, sizes, and specs on our product page. Let us know if you need anything else!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nAwesome question! We're glad you're interested in our catalog. Feel free to check out the size & spec guide on our site, or reply here if you need more help!\n\nBest,\n{StoreName} Support"
          ],
          empathetic: [
            "Hi {Name},\n\nI understand you want to be sure before ordering! Making the right choice is important. Please check our detailed product specs online or reply with any specific questions you have.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI know how helpful it is to have clear product details before purchasing. Please let us know if there is a specific feature or size requirement we can double-check for you.\n\nBest wishes,\n{StoreName} Team"
          ]
        }
      },
      'Complaint': {
        keywords: {
          'worst experience': 5, 'never again': 4, 'absolutely terrible': 5, 'unacceptable': 4,
          'disgusted': 3, 'furious': 4, 'horrible': 4, 'leaving a review': 4, 'reporting': 4,
          'dispute': 4, 'bad service': 4, 'pathetic': 4, 'bekaar': 3
        },
        responses: {
          professional: [
            "Hello {Name},\n\nWe have received your feedback regarding Order {Order}. We take your comments seriously and have logged this with our quality control management team for internal review.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nThank you for sharing your concerns regarding Order {Order}. We strive for high service standards and regret that your experience fell short. A manager will review your ticket.\n\nSincerely,\n{StoreName} Team"
          ],
          friendly: [
            "Hi {Name},\n\nWe're truly sorry to hear about your experience with Order {Order}. We really appreciate you letting us know so we can address the issue and do better next time.\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nThanks for writing to us regarding Order {Order}. We're sorry things didn't go smoothly. Our team is looking into what happened so we can make improvements.\n\nBest,\n{StoreName} Support"
          ],
          empathetic: [
            "Hi {Name},\n\nI am deeply sorry for your experience with Order {Order}. Your frustration is completely understandable. I have escalated your feedback to senior management to ensure this is thoroughly addressed.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI apologize sincerely for letting you down with Order {Order}. Your satisfaction is important to us, and we are reviewing this situation closely to prevent it from happening again.\n\nBest wishes,\n{StoreName} Team"
          ]
        }
      },
      'Technical': {
        keywords: {
          'can\'t log in': 5, 'password reset': 4, 'not working': 3, 'error message': 4,
          'page won\'t load': 4, 'error': 2, 'bug': 2, 'crash': 2, 'login': 2, 'password': 2,
          'account access': 3, 'checkout failing': 4, 'website down': 4
        },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for reporting the technical issue. Please try clearing your browser cache and cookies. If the problem persists, reply with a screenshot of the error message so our tech team can assist.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe acknowledge your report regarding account access / site performance. Our technical team monitors system status continuously. Please verify your login credentials or attempt a password reset.\n\nSincerely,\n{StoreName} Team"
          ],
          friendly: [
            "Hi {Name}!\n\nThanks for giving us a heads-up about this tech glitch! Try refreshing your page or clearing your cache. If that doesn't fix it, let us know what screen error you see!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nSorry for the tech hiccup! Our team is looking into site performance. Try resetting your password or switching browsers, and let us know if you need more assistance!\n\nBest,\n{StoreName} Support"
          ],
          empathetic: [
            "Hi {Name},\n\nI'm so sorry for the frustration this technical error has caused! Tech glitches are very annoying when you're trying to shop. Please reply with details or screenshots so an agent can help solve this.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI apologize for any inconvenience caused by this account error. We are prioritizing system stability and will gladly assist you if you are unable to access your account.\n\nBest wishes,\n{StoreName} Team"
          ]
        }
      },
      'Positive': {
        keywords: {
          'absolutely love': 5, 'amazing quality': 4, 'highly recommend': 4, 'best purchase': 4,
          'love it': 3, 'thank you so much': 3, 'great service': 3, 'amazing': 2, 'wonderful': 2,
          'bohot achha': 3, 'excellent': 3, 'kudos': 3
        },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for your positive feedback regarding Order {Order}. We are delighted to hear about your pleasant experience and appreciate your support.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe appreciate you taking the time to share your review of Order {Order}. Delivering high-quality products and service is our top priority.\n\nSincerely,\n{StoreName} Team"
          ],
          friendly: [
            "Hi {Name}!\n\nWow, thank you so much for the wonderful note about Order {Order}! We're thrilled that you love your purchase! Your feedback made our day.\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nThank you so much! We're so glad you're happy with Order {Order}. Thanks for being such a valued customer!\n\nBest,\n{StoreName} Support"
          ],
          empathetic: [
            "Hi {Name},\n\nYour message regarding Order {Order} warmed our team's hearts! Knowing we delivered a great experience for you is deeply rewarding. Thank you for sharing!\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nThank you from all of us for your lovely review of Order {Order}. We truly value your support and look forward to serving you again.\n\nBest wishes,\n{StoreName} Team"
          ]
        }
      },
      'Other': {
        keywords: {},
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for contacting us. We have received your inquiry regarding Order {Order}. An agent will review your details and respond as soon as possible.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe acknowledge receipt of your inquiry. Please reply with any additional details or order numbers to help us assist you faster.\n\nSincerely,\n{StoreName} Team"
          ],
          friendly: [
            "Hi {Name}!\n\nThanks for reaching out! We've received your message and an agent will get back to you shortly. Feel free to reply if you have extra details to share!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nWe got your message! We're reviewing your inquiry and will follow up with you as soon as possible.\n\nBest,\n{StoreName} Support"
          ],
          empathetic: [
            "Hi {Name},\n\nThank you for reaching out to us. We have received your note and are carefully reviewing it to make sure we give you the best possible assistance.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nWe appreciate you contacting us. Please know our team is looking into your inquiry and an agent will be in touch shortly.\n\nBest wishes,\n{StoreName} Team"
          ]
        }
      }
    };
  }

  // ── 1. INPUT SANITIZATION & VALIDATION ───────────────────
  sanitizeHTML(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  validateInput(rawText) {
    if (!rawText) {
      return { valid: false, error: 'Ticket cannot be empty. Please enter customer text.' };
    }

    const trimmed = rawText.trim();
    if (!trimmed) {
      return { valid: false, error: 'Ticket contains only spaces or line breaks. Please enter valid text.' };
    }

    if (trimmed.length < 10) {
      return { valid: false, error: 'Ticket text is too short. Minimum 10 characters required.' };
    }

    if (trimmed.length > 5000) {
      return { valid: false, error: 'Ticket text is too long (maximum 5,000 characters).' };
    }

    // Check for spam / repetitive characters
    const uniqueCharRatio = new Set(trimmed.toLowerCase()).size / trimmed.length;
    if (trimmed.length > 30 && uniqueCharRatio < 0.08) {
      return { valid: false, error: 'Ticket appears to contain repetitive spam characters.' };
    }

    return { valid: true, cleanText: this.sanitizeHTML(trimmed), rawText: trimmed };
  }

  detectPII(text) {
    const piiFound = [];
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) piiFound.push('Email address');
    if (/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) piiFound.push('Phone number');
    if (/\b(?:\d[ -]*?){13,16}\b/.test(text)) piiFound.push('Credit card number');
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) piiFound.push('SSN');

    return {
      hasPII: piiFound.length > 0,
      piiTypes: piiFound
    };
  }

  detectSpamAndAbuse(text) {
    const lower = text.toLowerCase();
    const spamWords = ['buy cheap', 'casino', 'free money', 'click here to win', 'crypto investment', 'whatsapp me'];
    const abusiveWords = ['idiot', 'stupid', 'bitch', 'bastard', 'scammer', 'fuck', 'shit', 'threaten'];

    const isSpam = spamWords.some(w => lower.includes(w));
    const isAbusive = abusiveWords.some(w => lower.includes(w));

    return { isSpam, isAbusive };
  }

  // ── 2. AI CLASSIFICATION & ANALYSIS ──────────────────────
  analyze(rawText) {
    const validation = this.validateInput(rawText);
    if (!validation.valid) {
      return {
        error: validation.error,
        valid: false
      };
    }

    const text = validation.rawText;
    const lowerText = text.toLowerCase();
    const piiResult = this.detectPII(text);
    const safetyResult = this.detectSpamAndAbuse(text);

    // Score all categories
    const scores = {};
    for (const [cat, data] of Object.entries(this.categories)) {
      scores[cat] = 0;
      if (cat === 'Other') continue;
      for (const [kw, weight] of Object.entries(data.keywords)) {
        if (lowerText.includes(kw.toLowerCase())) {
          scores[cat] += weight;
        }
      }
    }

    // Determine Primary and Secondary Intents
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    let primaryCategory = 'Other';
    let secondaryCategory = null;
    let maxScore = sortedScores[0][1];

    if (maxScore > 0) {
      primaryCategory = sortedScores[0][0];
      if (sortedScores[1] && sortedScores[1][1] >= 3 && (maxScore - sortedScores[1][1]) <= 3) {
        secondaryCategory = sortedScores[1][0];
      }
    }

    // Entity Extraction
    const orderMatch = text.match(/(?:#|order\s|ord-?|invoice\s?)(\d{4,8})/i);
    const orderNumber = orderMatch ? '#' + orderMatch[1] : null;

    let customerName = null;
    const sigMatch = text.match(/(?:-|best,|regards,|thanks,?\n|cheers,?\n|warmly,?\n|sincerely,?\n)\s*([a-zA-Z\s]{2,25})/i);
    if (sigMatch && sigMatch[1].trim()) {
      customerName = sigMatch[1].trim().split('\n')[0].trim();
    } else {
      const greetingMatch = text.match(/my name is ([a-zA-Z\s]{2,25})/i);
      if (greetingMatch) customerName = greetingMatch[1].trim();
    }

    let productMatch = text.match(/(?:ordered|bought|purchased|item|product) (?:a|an|the)?\s*([a-zA-Z0-9\s]{3,30}?)(?: yesterday| last| but| and|\.|\n|$)/i);
    if (!productMatch) productMatch = text.match(/"([^"]{3,30})"/);
    const productName = productMatch ? productMatch[1].trim() : null;

    // Issue Summary
    let issueSummary = text.split(/[.!?\n]/).find(s => s.trim().length > 10) || text;
    issueSummary = issueSummary.trim();
    if (issueSummary.length > 70) issueSummary = issueSummary.substring(0, 70) + '...';

    // Advanced Sentiment Detection
    let angryScore = 0;
    const angryWords = ['unacceptable', 'terrible', 'worst', 'furious', 'horrible', 'never again', 'disgusted', 'lawsuit', 'attorney', 'court', 'fraud'];
    angryWords.forEach(w => { if (lowerText.includes(w)) angryScore++; });

    const upperCaseMatches = text.match(/[A-Z]{4,}/g);
    if (upperCaseMatches && upperCaseMatches.length >= 2) angryScore++;

    const exclamationMatches = text.match(/!{2,}/g);
    if (exclamationMatches) angryScore++;

    // Sarcasm detection
    const sarcasmPhrase = lowerText.includes('oh great') || lowerText.includes('fantastic job') || lowerText.includes('thanks for nothing');

    let sentiment = 'Neutral';
    if (angryScore >= 2 || safetyResult.isAbusive) {
      sentiment = 'Angry';
    } else if (angryScore === 1 || primaryCategory === 'Complaint' || lowerText.includes('frustrat') || sarcasmPhrase) {
      sentiment = 'Frustrated';
    } else if (primaryCategory === 'Positive' || lowerText.includes('love') || lowerText.includes('thank')) {
      sentiment = 'Positive';
    }
    if (sarcasmPhrase) sentiment += ' (Sarcastic)';

    // Dynamic Priority Calculation & Reasoning
    let priority = 'Low';
    let priorityReason = 'Low urgency inquiry or general question.';

    const isLegalThreat = lowerText.includes('legal') || lowerText.includes('lawsuit') || lowerText.includes('attorney') || lowerText.includes('bbb') || lowerText.includes('consumer court');
    const isFraudOrSecurity = lowerText.includes('unauthorized') || lowerText.includes('stolen') || lowerText.includes('hacked') || lowerText.includes('security breach');
    const isFinancialIssue = lowerText.includes('charged twice') || lowerText.includes('double charge') || lowerText.includes('overcharge') || lowerText.includes('refund');
    const isFalseUrgency = (lowerText.includes('urgent') || lowerText.includes('asap')) && (primaryCategory === 'Product Question' || primaryCategory === 'Positive');

    if (isLegalThreat || isFraudOrSecurity || angryScore >= 3) {
      priority = 'Critical';
      priorityReason = isLegalThreat ? 'Critical — Customer threatened legal action or regulatory escalation.'
        : isFraudOrSecurity ? 'Critical — Potential fraud or unauthorized account activity.'
          : 'Critical — Extreme customer dissatisfaction and repeated escalation.';
    } else if (isFinancialIssue || lowerText.includes('asap') || lowerText.includes('urgent') || primaryCategory === 'Billing' || primaryCategory === 'Technical') {
      if (isFalseUrgency) {
        priority = 'Medium';
        priorityReason = 'Medium — Customer marked as urgent, but issue is an inquiry.';
      } else {
        priority = 'High';
        priorityReason = isFinancialIssue ? 'High — Payment or duplicate charge issue affecting customer funds.'
          : primaryCategory === 'Technical' ? 'High — Account access or checkout blocking issue.'
            : 'High — Immediate resolution requested for active order.';
      }
    } else if (primaryCategory === 'Return/Refund' || sentiment.includes('Frustrated')) {
      priority = 'Medium';
      priorityReason = 'Medium — Standard return request or moderate customer frustration.';
    }

    // Confidence Calculation
    let confidence = 75;
    if (maxScore >= 8) confidence += 15;
    else if (maxScore >= 4) confidence += 10;
    else if (maxScore === 0) confidence -= 25;

    const wordCount = text.split(/\s+/).length;
    if (wordCount < 12) confidence -= 15;
    if (wordCount > 150) confidence -= 5;
    if (wordCount >= 20 && wordCount <= 70) confidence += 5;
    if (orderNumber) confidence += 5;
    if (secondaryCategory) confidence -= 10;

    confidence = Math.max(15, Math.min(98, confidence));

    // Human Review Triggers
    const needsHumanReview = (
      confidence < 70 ||
      priority === 'Critical' ||
      primaryCategory === 'Billing' ||
      primaryCategory === 'Other' ||
      isLegalThreat ||
      isFraudOrSecurity ||
      safetyResult.isAbusive ||
      piiResult.hasPII ||
      secondaryCategory !== null
    );

    let reviewReason = '';
    if (needsHumanReview) {
      if (confidence < 70) reviewReason = 'Low AI Confidence (<70%). Verification recommended.';
      else if (priority === 'Critical') reviewReason = 'Critical Priority ticket requiring manager sign-off.';
      else if (isLegalThreat) reviewReason = 'Legal or regulatory reference detected.';
      else if (isFinancialIssue) reviewReason = 'Financial or billing adjustment requires agent approval.';
      else if (secondaryCategory) reviewReason = `Multiple intents detected (${primaryCategory} + ${secondaryCategory}).`;
      else if (piiResult.hasPII) reviewReason = 'Sensitive customer data (PII) detected.';
      else reviewReason = 'Human review required before sending.';
    }

    const initialStatus = needsHumanReview ? 'Human Review Required' : 'AI Analyzed';

    const tempAnalysis = {
      rawText: text,
      category: primaryCategory,
      priority,
      sentiment,
      orderNum: orderNumber,
      secondaryCategory
    };
    const timeSaved = this.calculateTimeSaved(tempAnalysis);

    return {
      valid: true,
      category: primaryCategory,
      secondaryCategory,
      priority,
      priorityReason,
      sentiment,
      confidence,
      timeSaved,
      needsHumanReview,
      needsReview: needsHumanReview,
      reviewReason,
      status: initialStatus,
      rawText: text,
      cleanText: validation.cleanText,
      customerName: customerName || '',
      orderNum: orderNumber || '',
      orderNumber: orderNumber || '',
      product: productName || '',
      productName: productName || '',
      summary: issueSummary,
      pii: piiResult,
      safety: safetyResult,
      extractedInfo: {
        orderNumber: orderNumber || 'Not detected',
        customerName: customerName || 'Not detected',
        productName: productName || 'Not detected',
        issueSummary
      },
      scores
    };
  }

  // ── Dynamic Time Saved Calculator ────────────────────────
  calculateTimeSaved(analysisData) {
    let minutes = 4; // Base time saved in minutes

    // 1. Text length factor (reading long ticket)
    const textLength = (analysisData.rawText || '').length;
    if (textLength > 1500) minutes += 6;
    else if (textLength > 800) minutes += 4;
    else if (textLength > 300) minutes += 2;

    // 2. Category complexity (manual research time saved)
    const cat = analysisData.category;
    if (cat === 'Billing' || cat === 'Complaint' || cat === 'Security/Fraud' || cat === 'Account Access') {
      minutes += 5;
    } else if (cat === 'Return/Refund' || cat === 'Shipping') {
      minutes += 3;
    } else if (cat === 'Product Question') {
      minutes += 2;
    }

    // 3. Priority & Sentiment complexity
    if (analysisData.priority === 'Critical') minutes += 5;
    else if (analysisData.priority === 'High') minutes += 3;

    if (analysisData.sentiment && (analysisData.sentiment.includes('Angry') || analysisData.sentiment.includes('Frustrated') || analysisData.sentiment.includes('Sarcastic'))) {
      minutes += 3;
    }

    // 4. Extracted info & Multi-intent bonus (lookup time saved)
    if (analysisData.orderNum && analysisData.orderNum !== 'Not detected') minutes += 2;
    if (analysisData.secondaryCategory) minutes += 2;

    return Math.min(30, Math.max(3, minutes));
  }

  // ── 3. SAFE DRAFT RESPONSE GENERATION ────────────────────
  generateDraft(analysis, storeName, tone = 'professional') {
    if (!analysis || !analysis.valid) {
      return "Hello,\n\nThank you for reaching out. We have received your ticket and a customer support agent will assist you shortly.\n\nBest regards,\nCustomer Support";
    }

    const cat = analysis.category || 'Other';
    const catData = this.categories[cat] || this.categories['Other'];
    const templates = catData.responses[tone] || catData.responses.professional;
    const template = templates[Math.floor(Math.random() * templates.length)];

    const custName = analysis.customerName || (analysis.extractedInfo && analysis.extractedInfo.customerName) || '';
    const nameStr = (custName && custName !== 'Not detected') ? custName : 'there';
    const orderNum = analysis.orderNum || analysis.orderNumber || (analysis.extractedInfo && analysis.extractedInfo.orderNumber);
    const orderStr = (orderNum && orderNum !== 'Not detected') ? orderNum : 'your order';

    let draft = template.replace(/{Name}/g, nameStr);
    draft = draft.replace(/{StoreName}/g, storeName || 'Our Store');

    if (orderNum && orderNum !== 'Not detected') {
      draft = draft.replace(/{Order}/g, orderStr);
    } else {
      draft = draft.replace(/Order {Order}/g, 'your recent order');
      draft = draft.replace(/{Order}/g, 'your order');
    }

    // If critical or missing key details, inject safe verification prompt
    if (analysis.needsHumanReview && !orderNum) {
      draft += "\n\n(Note: If you have an Order ID or transaction receipt, please reply with it so we can expedite your request.)";
    }

    return draft;
  }
}

window.AI = AI;

window.SAMPLE_TICKETS = [
  {
    id: 1,
    label: 'Angry Shipping',
    text: `I ordered a laptop case (Order #4521) THREE WEEKS AGO and it still hasn't arrived!! This is absolutely unacceptable. I've emailed twice before and nobody responds. If I don't receive my package by Friday, I'm disputing the charge with my bank and leaving a review on every platform I can find. This is the WORST customer service I've ever experienced.\n\n- Michael`
  },
  {
    id: 2,
    label: 'Return Request',
    text: `Hi there, I received my order #7834 yesterday but unfortunately the blue sweater I ordered is the wrong size. I ordered a Medium but received a Large. Could you please help me with a return or exchange? I'd prefer to exchange for the correct size if possible. Thanks!\n\nBest,\nSarah Jenkins`
  },
  {
    id: 3,
    label: 'Billing Issue',
    text: `Hello, I just noticed I was charged twice for my recent order (Order #2156). The amount of $49.99 appears on my credit card statement two times. Can you please look into this and refund the duplicate charge? Thank you.\n\n- Robert Chen`
  },
  {
    id: 4,
    label: 'Product Question',
    text: `Hey! I absolutely love the wireless earbuds I bought from your store last month. I want to buy another pair as a gift. Quick question - do they come in any other colors besides black? Also, is there a warranty included? Thanks so much!\n\nCheers,\nAlex`
  },
  {
    id: 5,
    label: 'Technical Issue',
    text: `I can't log into my account anymore. I've tried resetting my password three times but I never receive the reset email. I've checked my spam folder too. My username is mike_chen_2024. I have a pending order and I need to check the status. Please help ASAP.`
  }
];
