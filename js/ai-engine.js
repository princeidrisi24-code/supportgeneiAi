class SupportGenieAI {
  constructor() {
    this.categories = {
      'Shipping': {
        keywords: { 'hasn\'t arrived': 5, 'lost package': 5, 'tracking number': 4, 'not delivered': 4, 'ship': 1, 'deliver': 1, 'package': 1, 'arrive': 1, 'transit': 2, 'courier': 2, 'in transit': 3, 'where is my order': 5, 'shipping status': 4 },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for reaching out regarding Order {Order}. I've checked your tracking information, and it appears your package is currently in transit. It should arrive shortly. Let us know if you need any further assistance.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe appreciate you contacting us about Order {Order}. The shipping carrier is currently processing your delivery. We will continue to monitor its progress. Please reach out if it does not arrive within the expected timeframe.\n\nSincerely,\n{StoreName} Team",
            "Hello {Name},\n\nRegarding your inquiry for Order {Order}, we have confirmed that the shipment is on its way. You can use the provided tracking number to check its latest location. Let us know if you have other questions.\n\nBest,\n{StoreName} Support"
          ],
          friendly: [
            "Hi {Name}!\n\nThanks for checking in on Order {Order}! I took a look and your package is on its way. It should be arriving soon. Just hang tight, and let us know if you need anything else!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nThanks for reaching out! I checked on Order {Order} and everything looks good on our end. Your package is currently in transit. We can't wait for you to receive it!\n\nBest,\n{StoreName} Support",
            "Hi {Name},\n\nGood news about Order {Order}! Your package is en route and should be with you very soon. Feel free to reply if you need any more help.\n\nWarmly,\n{StoreName} Team"
          ],
          empathetic: [
            "Hi {Name},\n\nI completely understand your concern about Order {Order}. Waiting for a package can be stressful! I've checked the status and it is moving along. We're keeping an eye on it for you.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI'm so sorry for any worry regarding Order {Order}. I want to assure you that your package is currently in transit. We'll do everything we can to make sure it gets to you safely.\n\nBest wishes,\n{StoreName} Team",
            "Hello {Name},\n\nI know how frustrating it can be to wait for a delivery. I looked into Order {Order} and it is currently on its way. Please don't hesitate to reach back out if there are any further delays.\n\nSincerely,\n{StoreName} Support"
          ]
        }
      },
      'Billing': {
        keywords: { 'charged twice': 5, 'duplicate charge': 5, 'double charge': 4, 'credit card statement': 3, 'overcharged': 4, 'wrong amount': 4, 'charge': 1, 'refund': 2, 'payment': 1, 'invoice': 2, 'receipt': 2, 'billing': 2 },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for contacting us regarding the billing for Order {Order}. We are reviewing the transaction details and will process any necessary adjustments to your account within 3-5 business days.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe have received your inquiry about the payment for Order {Order}. Our billing team is currently investigating this matter and will reach out once it has been resolved.\n\nSincerely,\n{StoreName} Team",
            "Hello {Name},\n\nRegarding your recent billing question for Order {Order}, we are actively looking into your account. If a refund is due, it will be issued back to your original payment method.\n\nBest,\n{StoreName} Support"
          ],
          friendly: [
            "Hi {Name}!\n\nThanks for bringing this billing question for Order {Order} to our attention. We're taking a look right now and will get things sorted out for you as quickly as possible!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nI saw your message about the payment for Order {Order}. Don't worry, we're on it! We'll double-check the charges and make sure everything is correct.\n\nBest,\n{StoreName} Support",
            "Hi {Name},\n\nThanks for reaching out about Order {Order}! We're reviewing your billing details now. If there's any mix-up, we'll get it fixed right away.\n\nWarmly,\n{StoreName} Team"
          ],
          empathetic: [
            "Hi {Name},\n\nI'm so sorry for any stress this billing issue with Order {Order} has caused. Dealing with payment discrepancies is never fun. I'm looking into this immediately to get it resolved for you.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI completely understand your concern regarding the charges for Order {Order}. I am escalating this to our billing team right away to ensure your account is handled correctly.\n\nBest wishes,\n{StoreName} Team",
            "Hello {Name},\n\nI apologize for any confusion with your recent payment for Order {Order}. I know how important it is to have billing correct. We are prioritizing this issue and will update you shortly.\n\nSincerely,\n{StoreName} Support"
          ]
        }
      },
      'Return/Refund': {
        keywords: { 'wrong size': 5, 'wrong item': 5, 'wrong color': 4, 'doesn\'t fit': 4, 'send back': 3, 'return label': 4, 'return': 2, 'exchange': 3, 'damaged': 3, 'broken': 3, 'defective': 4 },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for reaching out about Order {Order}. We can certainly assist you with a return or exchange. Please find the attached return label and instructions for sending the item back.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe have received your return request for Order {Order}. Please package the item securely and use the provided shipping label. Once received, we will process your refund or exchange.\n\nSincerely,\n{StoreName} Team",
            "Hello {Name},\n\nRegarding your request for Order {Order}, we are happy to process this return. Our standard return policy applies. Please follow the instructions sent to your email to proceed.\n\nBest,\n{StoreName} Support"
          ],
          friendly: [
            "Hi {Name}!\n\nNo problem at all! We'd be happy to help you return or exchange the items from Order {Order}. I've generated a return label for you, just follow the easy steps attached!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nThanks for letting us know about Order {Order}. We want you to love your purchase! Let's get that return started for you right away. Check out the details below.\n\nBest,\n{StoreName} Support",
            "Hi {Name},\n\nLet's get that sorted out! For Order {Order}, returning is a breeze. Just use the label attached and we'll take care of the rest as soon as it gets back to us.\n\nWarmly,\n{StoreName} Team"
          ],
          empathetic: [
            "Hi {Name},\n\nI'm so sorry the item from Order {Order} didn't work out as expected! I completely understand how disappointing that can be. I've expedited a return label for you to make this as easy as possible.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI apologize that Order {Order} wasn't exactly what you hoped for. We certainly want to make this right. I'm providing a hassle-free return label so we can get this resolved for you quickly.\n\nBest wishes,\n{StoreName} Team",
            "Hello {Name},\n\nI'm sorry to hear about the issue with your item from Order {Order}. Please don't worry, I'm here to help you get this returned or exchanged smoothly without any extra stress.\n\nSincerely,\n{StoreName} Support"
          ]
        }
      },
      'Product Question': {
        keywords: { 'does it come in': 4, 'available in': 3, 'quick question': 4, 'compatible with': 4, 'how to use': 4, 'size guide': 4, 'size': 1, 'color': 1, 'material': 2, 'warranty': 3, 'specifications': 3, 'features': 2 },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for your inquiry. Regarding your question, we can confirm the product details you requested. Please refer to our website for full specifications.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe appreciate your interest in our products. The item you asked about does feature the specifications mentioned. Let us know if you require further technical details.\n\nSincerely,\n{StoreName} Team",
            "Hello {Name},\n\nThank you for reaching out with your product question. We have detailed information available on the product page, but to answer directly: yes, it meets your criteria.\n\nBest,\n{StoreName} Support"
          ],
          friendly: [
            "Hi {Name}!\n\nThanks for reaching out! That's a great question about our product. Yes, it does have the features you're looking for! Let me know if you want to know anything else.\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nAwesome question! I'm happy to let you know that the product works exactly as you asked. We think you'll really love it!\n\nBest,\n{StoreName} Support",
            "Hi {Name},\n\nThanks for asking! I checked on that for you, and the answer is yes. Feel free to ask if you have any more questions before making your choice!\n\nWarmly,\n{StoreName} Team"
          ],
          empathetic: [
            "Hi {Name},\n\nI understand you want to be sure before purchasing. It's totally valid to ask! I've double-checked the details, and I can confirm the product fits your needs.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI know how important it is to get all the details right. I'm glad you asked! The product does indeed have the options you're looking for.\n\nBest wishes,\n{StoreName} Team",
            "Hello {Name},\n\nI'd be happy to help clear that up for you! Making the right choice is important. To answer your question, yes, the product details align with what you're hoping for.\n\nSincerely,\n{StoreName} Support"
          ]
        }
      },
      'Complaint': {
        keywords: { 'worst experience': 5, 'never again': 4, 'absolutely terrible': 5, 'unacceptable': 3, 'disgusted': 3, 'furious': 3, 'horrible': 3, 'leaving a review': 4, 'reporting': 3, 'dispute': 4 },
        responses: {
          professional: [
            "Hello {Name},\n\nWe have received your feedback regarding Order {Order}. We take your comments seriously and are reviewing the situation internally to ensure this does not happen again.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nThank you for sharing your concerns about Order {Order}. We aim for high standards and regret that we fell short in this instance. Your feedback has been noted by our management team.\n\nSincerely,\n{StoreName} Team",
            "Hello {Name},\n\nWe acknowledge your complaint regarding Order {Order}. Please accept our apologies for the inconvenience. We are committed to improving our services based on your feedback.\n\nBest,\n{StoreName} Support"
          ],
          friendly: [
            "Hi {Name},\n\nI'm sorry to hear you had a negative experience with Order {Order}. We really appreciate you letting us know so we can do better next time. We hope to make it up to you!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nThanks for reaching out about Order {Order}. We're bummed to hear things didn't go perfectly. We're looking into what happened so we can improve!\n\nBest,\n{StoreName} Support",
            "Hi {Name},\n\nWe appreciate your honest feedback about Order {Order}. We always want to provide a great experience, and we're sorry we missed the mark this time. We'll work hard to improve.\n\nWarmly,\n{StoreName} Team"
          ],
          empathetic: [
            "Hi {Name},\n\nI am incredibly sorry to hear about your experience with Order {Order}. Your frustration is completely understandable, and it is unacceptable that this happened. I am personally looking into this to make things right.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI am deeply sorry that we let you down with Order {Order}. Please know that we truly value you, and I am escalating your concerns immediately to ensure we address this failure in our service.\n\nBest wishes,\n{StoreName} Team",
            "Hello {Name},\n\nI sincerely apologize for the terrible experience you've had with Order {Order}. I know how upsetting this must be. Please give us a chance to resolve this for you; your satisfaction is deeply important to us.\n\nSincerely,\n{StoreName} Support"
          ]
        }
      },
      'Technical': {
        keywords: { 'can\'t log in': 5, 'password reset': 4, 'not working': 3, 'error message': 4, 'page won\'t load': 4, 'error': 2, 'bug': 2, 'crash': 2, 'login': 2, 'password': 2, 'account access': 3 },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for reporting the technical issue. Our engineering team has been notified and is currently investigating the problem. We will update you once it is resolved.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe acknowledge the system error you experienced. Please try clearing your browser cache as a preliminary step. If the issue persists, our technical team is working on a permanent fix.\n\nSincerely,\n{StoreName} Team",
            "Hello {Name},\n\nThank you for reaching out regarding the website error. We are currently experiencing some technical difficulties and our team is actively working to restore full functionality.\n\nBest,\n{StoreName} Support"
          ],
          friendly: [
            "Hi {Name}!\n\nThanks for letting us know about this glitch! Our tech team is on it and squashing those bugs right now. Give it another try in a little bit!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nOh no, sorry about the tech trouble! Thanks for the heads up. We're working on getting everything running smoothly again as fast as we can.\n\nBest,\n{StoreName} Support",
            "Hi {Name},\n\nThanks for reaching out! We see the error on our end too and we're working quickly to fix it. We really appreciate your patience while we get things sorted!\n\nWarmly,\n{StoreName} Team"
          ],
          empathetic: [
            "Hi {Name},\n\nI'm so sorry for the frustration this technical issue is causing! I know how annoying it is when things don't work as they should. Our team is treating this as a priority to get you back up and running.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI completely understand how disruptive this error is for you. Please accept my apologies. I've escalated this directly to our technical team so they can resolve it immediately.\n\nBest wishes,\n{StoreName} Team",
            "Hello {Name},\n\nI'm so sorry you ran into this bug! I know you're trying to get things done. We are working diligently to fix this right away so you don't have to deal with it anymore.\n\nSincerely,\n{StoreName} Support"
          ]
        }
      },
      'Positive': {
        keywords: { 'absolutely love': 5, 'amazing quality': 4, 'highly recommend': 4, 'best purchase': 4, 'love it': 3, 'thank you so much': 3, 'great service': 3, 'amazing': 2, 'wonderful': 2 },
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for your positive feedback regarding Order {Order}. We are pleased to hear that you are satisfied with your purchase. We value your business.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe appreciate you taking the time to share your excellent experience with Order {Order}. We strive to provide high-quality products and service.\n\nSincerely,\n{StoreName} Team",
            "Hello {Name},\n\nThank you for your kind words about Order {Order}. We are glad we could meet your expectations. We look forward to serving you again.\n\nBest,\n{StoreName} Support"
          ],
          friendly: [
            "Hi {Name}!\n\nWow, thank you so much for the amazing feedback on Order {Order}! We're thrilled that you love it! Your message totally made our day.\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nThis is fantastic to hear! We're so glad you're happy with Order {Order}. Thanks for being such an awesome customer!\n\nBest,\n{StoreName} Support",
            "Hi {Name},\n\nThanks a million for the kind words about Order {Order}! We love hearing from happy customers like you. Enjoy your purchase!\n\nWarmly,\n{StoreName} Team"
          ],
          empathetic: [
            "Hi {Name},\n\nYour message about Order {Order} truly warmed our hearts! It means so much to our team to know we made a positive impact. Thank you for sharing your joy with us!\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nThank you from the bottom of our hearts for your lovely feedback on Order {Order}. Knowing you are so happy with everything is exactly why we do what we do.\n\nBest wishes,\n{StoreName} Team",
            "Hello {Name},\n\nI was so touched reading your comments about Order {Order}. It is incredibly rewarding to hear such positive experiences. Thank you for making our day so much brighter!\n\nSincerely,\n{StoreName} Support"
          ]
        }
      },
      'Other': {
        keywords: {},
        responses: {
          professional: [
            "Hello {Name},\n\nThank you for contacting us. We have received your inquiry and will review it shortly. Please let us know if you have any additional information to add.\n\nBest regards,\n{StoreName} Support",
            "Dear {Name},\n\nWe acknowledge receipt of your message. A representative will look into your request and get back to you with further information.\n\nSincerely,\n{StoreName} Team",
            "Hello {Name},\n\nThank you for reaching out. We are currently reviewing your inquiry and will respond as soon as we have an update for you.\n\nBest,\n{StoreName} Support"
          ],
          friendly: [
            "Hi {Name}!\n\nThanks for getting in touch! We've received your message and we're looking into it now. We'll get back to you soon!\n\nCheers,\n{StoreName} Team",
            "Hey {Name},\n\nThanks for reaching out! We're taking a look at your request and will follow up with you as soon as possible.\n\nBest,\n{StoreName} Support",
            "Hi {Name},\n\nWe got your message! We're reviewing everything on our end and will be in touch shortly. Let us know if you need anything else in the meantime!\n\nWarmly,\n{StoreName} Team"
          ],
          empathetic: [
            "Hi {Name},\n\nThank you so much for reaching out to us. I want to assure you we've received your message and are carefully reviewing it so we can help you out.\n\nTake care,\n{StoreName} Support",
            "Dear {Name},\n\nI appreciate you taking the time to contact us. Please know we are looking into your request and will do everything we can to assist you shortly.\n\nBest wishes,\n{StoreName} Team",
            "Hello {Name},\n\nThank you for your message. We value your inquiry and are personally reviewing it to ensure we provide the best possible response for you soon.\n\nSincerely,\n{StoreName} Support"
          ]
        }
      }
    };
  }

  analyze(text) {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    
    // Category Scoring
    let scores = {};
    for (const [cat, data] of Object.entries(this.categories)) {
      scores[cat] = 0;
      for (const [kw, weight] of Object.entries(data.keywords)) {
        if (lowerText.includes(kw)) {
          scores[cat] += weight;
        }
      }
    }
    
    let primaryCategory = 'Other';
    let maxScore = 0;
    for (const [cat, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryCategory = cat;
      }
    }

    // Extraction
    const orderMatch = text.match(/(?:#|order\s|ord-?)(\d{4,6})/i);
    const orderNumber = orderMatch ? orderMatch[1] : null;

    let customerName = 'Customer';
    const sigMatch = text.match(/(?:-|best,|regards,|thanks,?\n|cheers,?\n|warmly,?\n)\s*([a-zA-Z\s]+)/i);
    if (sigMatch && sigMatch[1].trim()) {
        customerName = sigMatch[1].trim().split('\n')[0].trim();
    } else {
        const greetingMatch = text.match(/my name is ([a-zA-Z\s]+)/i);
        if (greetingMatch) customerName = greetingMatch[1].trim();
    }

    let productMatch = text.match(/(?:ordered|bought|purchased) (?:a|an) ([a-zA-Z\s]+?)(?: yesterday| last| but| and|\.)/i);
    if(!productMatch) productMatch = text.match(/"([^"]+)"/);
    const productName = productMatch ? productMatch[1].trim() : null;
    
    // Issue Summary (first sentence usually)
    let issueSummary = text.split(/[.!?\n]/).find(s => s.trim().length > 10) || text;
    issueSummary = issueSummary.trim();
    if(issueSummary.length > 60) issueSummary = issueSummary.substring(0, 60) + '...';

    // Sentiment Analysis
    let angryScore = 0;
    const angryWords = ['unacceptable', 'terrible', 'worst', 'furious', 'horrible', 'never again', 'disgusted'];
    angryWords.forEach(w => { if (lowerText.includes(w)) angryScore++; });
    
    const upperCaseMatches = text.match(/[A-Z]{3,}/g);
    if (upperCaseMatches && upperCaseMatches.length > 1) angryScore++;
    
    const exclamationMatches = text.match(/!{2,}/g);
    if (exclamationMatches) angryScore++;

    let sentiment = 'Neutral 😐';
    if (angryScore >= 2) sentiment = 'Angry 😠';
    else if (angryScore === 1 || primaryCategory === 'Complaint' || lowerText.includes('frustrat')) sentiment = 'Frustrated 😤';
    else if (primaryCategory === 'Positive') sentiment = 'Positive 😊';

    // Priority
    let priority = 'Low';
    if (lowerText.includes('legal') || lowerText.includes('bbb') || lowerText.includes('dispute') || lowerText.includes('chargeback') || (lowerText.includes('threat') && lowerText.includes('review')) || (angryScore >= 3)) {
        priority = 'Critical';
    } else if (lowerText.includes('refund') || lowerText.includes('charged') || lowerText.includes('money') || lowerText.includes('asap') || lowerText.includes('urgent') || angryScore > 1 || primaryCategory === 'Billing') {
        priority = 'High';
    } else if (primaryCategory === 'Return/Refund' || primaryCategory === 'Technical' || sentiment === 'Frustrated 😤') {
        priority = 'Medium';
    }

    // Confidence
    let confidence = 75;
    if (maxScore > 8) confidence += 15;
    else if (maxScore > 4) confidence += 10;
    else if (maxScore === 0) confidence -= 20;
    
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 10) confidence -= 15;
    if (wordCount > 150) confidence -= 5;
    if (wordCount >= 20 && wordCount <= 60) confidence += 5;
    
    if (orderNumber) confidence += 5;
    
    // Check for ties in top categories
    let topScore = 0;
    let tieCount = 0;
    for(const score of Object.values(scores)) {
      if(score > topScore) { topScore = score; tieCount = 1; }
      else if(score === topScore && score > 0) { tieCount++; }
    }
    if(tieCount > 1) confidence -= 15;

    confidence = Math.max(10, Math.min(98, confidence));

    const needsHumanReview = priority === 'Critical' || confidence < 50 || angryScore >= 2;

    return {
      category: primaryCategory,
      priority,
      sentiment,
      confidence,
      needsHumanReview,
      needsReview: needsHumanReview,
      rawText: text,
      customerName: customerName !== 'Customer' ? customerName : '',
      orderNum: orderNumber || '',
      orderNumber: orderNumber || '',
      product: productName || '',
      productName: productName || '',
      summary: issueSummary,
      extractedInfo: {
        orderNumber,
        customerName,
        productName,
        issueSummary
      },
      scores
    };
  }

  generateDraft(analysis, storeName, tone = 'professional') {
    const cat = analysis.category;
    const catData = this.categories[cat] || this.categories['Other'];
    const templates = catData.responses[tone] || catData.responses.professional;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const custName = analysis.customerName || (analysis.extractedInfo && analysis.extractedInfo.customerName) || 'Customer';
    const orderNum = analysis.orderNum || analysis.orderNumber || (analysis.extractedInfo && analysis.extractedInfo.orderNumber);

    let draft = template.replace(/{Name}/g, custName);
    draft = draft.replace(/{StoreName}/g, storeName || 'Our Store');
    
    if (orderNum) {
        const formattedOrder = orderNum.toString().startsWith('#') ? orderNum : '#' + orderNum;
        draft = draft.replace(/{Order}/g, formattedOrder);
    } else {
        draft = draft.replace(/Order {Order}/g, 'your recent order');
        draft = draft.replace(/{Order}/g, 'your order');
    }

    return draft;
  }
}

window.SupportGenieAI = SupportGenieAI;

window.SAMPLE_TICKETS = [
  {
    id: 1,
    label: '😤 Angry Shipping',
    text: `I ordered a laptop case (Order #4521) THREE WEEKS AGO and it still hasn't arrived!! This is absolutely unacceptable. I've emailed twice before and nobody responds. If I don't receive my package by Friday, I'm disputing the charge with my bank and leaving a review on every platform I can find. This is the WORST customer service I've ever experienced.\n\n- Michael`
  },
  {
    id: 2,
    label: '📦 Return Request',
    text: `Hi there, I received my order #7834 yesterday but unfortunately the blue sweater I ordered is the wrong size. I ordered a Medium but received a Large. Could you please help me with a return or exchange? I'd prefer to exchange for the correct size if possible. Thanks!\n\nBest,\nSarah Jenkins`
  },
  {
    id: 3,
    label: '💳 Billing Issue',
    text: `Hello, I just noticed I was charged twice for my recent order (Order #2156). The amount of $49.99 appears on my credit card statement two times. Can you please look into this and refund the duplicate charge? Thank you.\n\n- Robert Chen`
  },
  {
    id: 4,
    label: '❓ Product Question',
    text: `Hey! I absolutely love the wireless earbuds I bought from your store last month. I want to buy another pair as a gift. Quick question - do they come in any other colors besides black? Also, is there a warranty included? Thanks so much!\n\nCheers,\nAlex`
  },
  {
    id: 5,
    label: '🔧 Technical Issue',
    text: `I can't log into my account anymore. I've tried resetting my password three times but I never receive the reset email. I've checked my spam folder too. My username is mike_chen_2024. I have a pending order and I need to check the status. Please help ASAP.`
  }
];
