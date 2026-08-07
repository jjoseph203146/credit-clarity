-- Questionnaire answers on the report itself.
--
-- `users.goal/timeline/challenge` already exist, but they cannot carry this
-- data in the primary funnel. In the anonymous flow the order is:
--
--   upload -> preview -> pay -> webhook runs the AI analysis -> signup
--
-- The analysis runs before any account exists, so anything stored only on
-- `users` arrives too late to shape the plan it was collected for. That is why
-- action_plans.goal_snapshot has always been null: nothing wrote the goal, and
-- even once something did, it would have been written after the analysis.
--
-- Storing the answers on the report closes that gap — they are captured
-- between the free preview and checkout, so runAnalysis() can read them. They
-- are copied onto the users row when the report is claimed at signup, so
-- /goals and later reports still see them.

alter table reports
  add column if not exists goal text
    check (goal in ('build_credit','recover_mistakes','pay_down_debt','major_purchase','understand_finances')),
  add column if not exists timeline text
    check (timeline in ('30_days','90_days','6_months','long_term')),
  add column if not exists challenge text
    check (challenge in ('debt','missed_payments','collections','low_score','lack_of_understanding'));
