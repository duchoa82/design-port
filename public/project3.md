# Data-inform to decrease the delay in delivery order

Improve customer satisfaction with the following data to create a solution that has an opportunity to increase revenue

## Understanding

Following the example of data, I understand that products are now facing highly delayed delivery which leads to
- **Operation Cost.**
- **User Experiences.**
Thus, it will affect the user’s retention rate, which is the main factor in increasing the company's revenue.

So, in this presentation, I like to go through the solutions that help the product increase the
- **On-Time delivery**
- **User experiences.**
- **Retention Rate.**

## **Data Analysis**
**Delayed Order Factor**

After reading all the requirements, it would be nice to have logical thinking to clarify the task.

The table data shows the relative between delivery status with
- Vehicle.
- Distance.
- Hub Location.
![](/projects/project-details/project3/project3-img1.png)
After analyzing the data, I saw that the Delivery Status affects the user experience.

- When the Delivery Status is **On-Time**, The rating is always in the **Happy** range
- When the Delivery Status is Delayed, The rating is always in the **Acceptable or Un-Happy**  range

**So we can say that, to improve the user experiences we should to delivery on-time.**

**Next, we will dig into “What makes the delivery delayed?”**

To find the answer to the question above, I like to find the relevance between Delivery Status and other data such as Vehicle, Distances, Hub Location, and Driver ID.

| **Factor** | **Relationship** | **Impact** |
| --- | --- | --- |
| **Vehicle** | Related directly | Vehicle affects delivery status directly. When the Vehicle is **Bike**, the Delivery Status is **On-Time**. When the Vehicle is a **Truck**, the Delivery Status is **Delayed**. |
| **Hub Location** | Not related directly | The Hub location affects Vehicle value. |
| **Distances, Driver ID** | Not affected at all | The Distances longer not affect the delivery status. |

**Conclusion**

- **Delayed Order is affected by the Vehicle, this is the Truck**

### Current Retention Rate

To calculate the current Retention Percentage. I like to analyze the percentage of customer happiness based on Likert scoring.
Table view customer feedback follows the Delivery Status.

![](/projects/project-details/project3/project3-img2.png)
Percentage of customer feedback
![](/projects/project-details/project3/project3-img3.png)
I assume that which rate has its retention rate (should be reflected in the real data)

Easy to see that, on the Likert Scoring to show the happiness of customers to our services, we have 300 users in a month with 3 range of users satisfied.

| **Rate** | **Percentage** |
|---------|---------------|
| 2        | 20.1%          |
| 3        | 30.1%          |
| 4        | 30.1%          |
| 5        | 19.7%          |


## **Product Research**

To answer these questions, I like to make a simple blueprint combined with job steps and How-Might-We statements to figure out the outcomes.
![](/projects/project-details/project3/project3-img4.png)
**Outcomes**

The data shows the problems and the cause of the delayed order. The root cause of the truck being delayed is still undiscovered.
Thus, I like to make assumptions based on my research with the observations, and the support from ChatGPT & Gemini.

From all the assumptions, I like to list all the outcomes for the system to help drivers deliver on time below.

| Outcomes (How-might-we statement) | Purpose |
| --- | --- |
| **Provides the optimized routine for the driver based on their delivery package.** | Help the drivers drive to their destination with a smarter schedule without effort. |
| **Provides the traffic information for the drivers.** | Help the drivers avoid the traffic jams which may affect the delivery time |
| **Provides more categories to classify the order. It helps the order have more delivery method** | Help reduce the order delivery by Truck. |
| **Optimize the estimated receive time from the collected data** | Collecting pickup to delivery time following the distance, hub, or delivery area helps eta the shipped time better.  |
| **Gather the delayed reasons to improve** | The data set now lacks the reason for why delayed Driver which may help the product team to have better solutions. |

## **STRATEGY**

Building the system with Data-Driven and Machine Learning reduces the delayed time

**Phase 1**

- **Integrate with Map System API**, to give the traffic information to both driver and user. It not only helps drivers to be flexible in their route but also gives the reason for delays to the user.
- **Gathering the Delivery location**, then build the routine for the Driver.
- **Gathering the delayed factors**, and **time delivery** in each area ****to improve for the next phases.

**Phase 2**

- **Build the classify system,** to help the system filter the order. It helps to assign the delivery vehicle better.
- **Continue building the Machine Learning** based on **Traffic information**, **time delivery**, and **delivery location** to provide a better estimate of time, and driver’s route.

---

## Metric Definition Successful Metric (KPIs)

To calculate the metric, I assume that the Delayed Order affects the **User’s Retention** which is not shown in the data sheet.

Thus, to define the successful metric or how many percentages of Delayed Orders need to be covert, we need to target the Retention metric instead.

Back to the datasheet, I have drawn the table data to show the relative between Customer Feedback and the Delivery Status.

Then the metric should be

| Metric |  |
| --- | --- |
| User Feedback | Increase the rate at 4 and 5, decrease the 2 and 3 |
| Gathering the user pain points from scoring they give to us | Ask users more questions about how they give the low score. |
| Gathering the data to conclude about the relative between Rate Scale and Retention  | To set the better KPIs and the solution for the revenue. |
| Amount of Delayed Order | Reduce the delayed order through the phases. |