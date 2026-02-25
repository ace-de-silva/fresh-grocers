/**
 * Fresh Grocers - Proximity-Based Delivery Assignment Algorithm
 *
 * Ranks available agents by:
 *   1. Distance to customer (60% weight)
 *   2. Current workload (lower is better)
 *   3. Agent rating (higher is better)
 */

const Algorithm = (() => {

  /**
   * Simulated distance matrix between Sri Lankan postal code areas (in km).
   * Key format: "AREA1|AREA2" (order-independent lookup).
   */
  const DISTANCE_MATRIX = {
    'Colombo 1|Colombo 2': 1.5,
    'Colombo 1|Colombo 3': 2,
    'Colombo 1|Colombo 4': 3,
    'Colombo 1|Colombo 5': 4,
    'Colombo 1|Colombo 6': 5,
    'Colombo 1|Colombo 7': 2.5,
    'Colombo 1|Colombo 10': 3,
    'Colombo 1|Colombo 12': 2,
    'Colombo 1|Colombo 15': 4.5,
    'Colombo 1|Nugegoda': 9,
    'Colombo 1|Dehiwala': 8,
    'Colombo 1|Ratmalana': 12,
    'Colombo 1|Moratuwa': 14,
    'Colombo 1|Gampaha': 30,
    'Colombo 1|Negombo': 37,
    'Colombo 1|Kandy': 115,
    'Colombo 1|Galle': 116,
    'Colombo 1|Matara': 158,
    'Colombo 1|Kurunegala': 93,
    'Colombo 2|Colombo 3': 1.5,
    'Colombo 2|Colombo 4': 2.5,
    'Colombo 2|Colombo 5': 3.5,
    'Colombo 2|Colombo 6': 4.5,
    'Colombo 2|Colombo 7': 2,
    'Colombo 2|Colombo 10': 2.5,
    'Colombo 2|Colombo 12': 1.5,
    'Colombo 2|Colombo 15': 4,
    'Colombo 2|Nugegoda': 9.5,
    'Colombo 2|Dehiwala': 8.5,
    'Colombo 2|Moratuwa': 14.5,
    'Colombo 2|Gampaha': 31,
    'Colombo 2|Negombo': 38,
    'Colombo 3|Colombo 4': 2,
    'Colombo 3|Colombo 5': 3,
    'Colombo 3|Colombo 6': 4,
    'Colombo 3|Colombo 7': 2,
    'Colombo 3|Colombo 10': 2.5,
    'Colombo 3|Colombo 12': 1.5,
    'Colombo 3|Colombo 15': 4,
    'Colombo 3|Nugegoda': 8.5,
    'Colombo 3|Dehiwala': 7.5,
    'Colombo 3|Ratmalana': 11.5,
    'Colombo 3|Moratuwa': 13.5,
    'Colombo 3|Gampaha': 29,
    'Colombo 3|Negombo': 36,
    'Colombo 3|Kandy': 113,
    'Colombo 3|Galle': 114,
    'Colombo 4|Colombo 5': 2,
    'Colombo 4|Colombo 6': 3,
    'Colombo 4|Colombo 7': 2.5,
    'Colombo 4|Colombo 10': 3.5,
    'Colombo 4|Nugegoda': 7,
    'Colombo 4|Dehiwala': 6,
    'Colombo 4|Moratuwa': 12,
    'Colombo 4|Gampaha': 31,
    'Colombo 4|Negombo': 38,
    'Colombo 5|Colombo 6': 2,
    'Colombo 5|Colombo 7': 3,
    'Colombo 5|Colombo 10': 4,
    'Colombo 5|Nugegoda': 5,
    'Colombo 5|Dehiwala': 5.5,
    'Colombo 5|Ratmalana': 9,
    'Colombo 5|Moratuwa': 11,
    'Colombo 5|Gampaha': 32,
    'Colombo 5|Negombo': 39,
    'Colombo 6|Colombo 7': 4,
    'Colombo 6|Nugegoda': 4,
    'Colombo 6|Dehiwala': 3.5,
    'Colombo 6|Moratuwa': 9,
    'Colombo 6|Gampaha': 33,
    'Colombo 7|Colombo 10': 2,
    'Colombo 7|Colombo 12': 3,
    'Colombo 7|Nugegoda': 8,
    'Colombo 7|Dehiwala': 7,
    'Colombo 7|Moratuwa': 13,
    'Colombo 7|Gampaha': 30,
    'Colombo 7|Negombo': 37,
    'Colombo 10|Colombo 12': 1.5,
    'Colombo 10|Nugegoda': 9,
    'Colombo 10|Dehiwala': 8,
    'Colombo 10|Gampaha': 28,
    'Colombo 10|Negombo': 35,
    'Colombo 12|Nugegoda': 10,
    'Colombo 12|Negombo': 36,
    'Colombo 15|Negombo': 25,
    'Colombo 15|Gampaha': 22,
    'Nugegoda|Dehiwala': 4,
    'Nugegoda|Ratmalana': 7,
    'Nugegoda|Moratuwa': 9,
    'Nugegoda|Gampaha': 35,
    'Nugegoda|Kandy': 108,
    'Dehiwala|Ratmalana': 4,
    'Dehiwala|Moratuwa': 6,
    'Dehiwala|Gampaha': 36,
    'Ratmalana|Moratuwa': 3,
    'Ratmalana|Galle': 105,
    'Moratuwa|Galle': 100,
    'Moratuwa|Matara': 143,
    'Gampaha|Negombo': 10,
    'Gampaha|Kandy': 95,
    'Gampaha|Kurunegala': 65,
    'Negombo|Kandy': 103,
    'Negombo|Kurunegala': 60,
    'Kandy|Kurunegala': 44,
    'Kandy|Galle': 185,
    'Galle|Matara': 42
  };

  /**
   * Get distance between two areas (km).
   * Returns a default of 60km if the pair isn't in the matrix.
   */
  function calculateDistance(area1, area2) {
    if (!area1 || !area2) return 60;
    if (area1 === area2) return 0;
    const key1 = `${area1}|${area2}`;
    const key2 = `${area2}|${area1}`;
    return DISTANCE_MATRIX[key1] ?? DISTANCE_MATRIX[key2] ?? 60;
  }

  /**
   * Calculate a composite score for an agent (lower = better).
   * Score = (distance * 0.6) + (workload * 5) - (rating * 2)
   */
  function calculateScore(agent, distance) {
    const distanceScore  = distance * 0.6;
    const workloadScore  = (agent.currentWorkload || 0) * 5;
    const ratingBonus    = (agent.rating || 0) * 2;
    return distanceScore + workloadScore - ratingBonus;
  }

  /**
   * Returns the top N recommended agents for a given order.
   * @param {Object} order  - order object with `area` property
   * @param {number} topN   - how many to return (default 3)
   * @returns {Array}       - agent objects augmented with `distance` and `score`
   */
  function getRecommendedAgents(order, topN = 3) {
    const onlineAgents = DB.agents.getOnline();
    if (!onlineAgents.length) return [];

    const customerArea = order.area || order.deliveryAddress || '';

    const ranked = onlineAgents.map(agent => {
      const distance = calculateDistance(customerArea, agent.area || agent.currentLocation);
      const score = calculateScore(agent, distance);
      return { ...agent, distance, score };
    });

    ranked.sort((a, b) => a.score - b.score);
    return ranked.slice(0, topN);
  }

  /**
   * Assign a specific agent to an order.
   * Updates order, creates a delivery record, notifies parties.
   */
  function assignAgent(orderId, agentId) {
    const order = DB.orders.getById(orderId);
    const agent = DB.agents.getById(agentId);
    if (!order || !agent) return { success: false, error: 'Order or agent not found' };

    // Update order
    DB.orders.update(orderId, {
      assignedAgentID: agentId,
      assignedDate: new Date().toISOString(),
      deliveryStatus: 'Out for Delivery'
    });

    // Create delivery record (if not already exists)
    const existing = DB.deliveries.getByOrder(orderId);
    if (!existing) {
      DB.deliveries.add({ orderID: orderId, agentID: agentId, deliveryStatus: 'Assigned' });
    } else {
      DB.deliveries.update(existing.deliveryID, { agentID: agentId, deliveryStatus: 'Assigned', assignedDate: new Date().toISOString() });
    }

    // Simulate notifications
    const customer = DB.customers.getById(order.customerID);
    if (customer) {
      Utils.simulateSMS(customer.phone,
        `Your order ${orderId} has been assigned to ${agent.name} (${agent.phone}). Estimated delivery: 30-60 mins.`
      );
    }
    Utils.simulateSMS(agent.phone,
      `New delivery assigned: Order ${orderId}. Customer: ${customer?.name}. Address: ${order.deliveryAddress}`
    );

    return { success: true, order: DB.orders.getById(orderId), agent };
  }

  /**
   * Auto-assign the best agent (rank #1) to an order.
   */
  function autoAssign(orderId) {
    const order = DB.orders.getById(orderId);
    if (!order) return { success: false, error: 'Order not found' };
    const recommendations = getRecommendedAgents(order, 1);
    if (!recommendations.length) return { success: false, error: 'No online agents available' };
    return assignAgent(orderId, recommendations[0].agentID);
  }

  return {
    calculateDistance,
    calculateScore,
    getRecommendedAgents,
    assignAgent,
    autoAssign,
    DISTANCE_MATRIX
  };
})();
