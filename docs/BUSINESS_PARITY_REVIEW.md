# Business parity review — 29 September 2026

Compared the Angular frontend in `D:/Full-Stack/frontend_refactor` and the API in `D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem` against the legacy ASP.NET/Next.js project in `D:/Full-Stack/TaskManagementSystem_Ver1.0`. The frontend's LOCAL_DEV.md and dev-stack.ps1 identify this API as its backend. Ver1.0 is the baseline used here; Ver2.0 was located but was not treated as the authoritative legacy baseline.

This is a source-level business review, not a live acceptance test or a visual-theme review. Findings trace legacy behavior to current UI, contracts, handlers, and endpoint registration. No application code or data was changed. Existing backend working-tree changes were included as found and left untouched. Runtime reproduction and product-owner confirmation of intentional retirements remain necessary before declaring full parity.

**Result: 11 actionable business gaps or regressions.** The major screens exist, but several underlying operations do not preserve legacy behavior. P1 means a core workflow or trusted business output is affected; P2 means a missing operation or reporting capability.

| Priority | Finding | Affected layers |
|---|---|---|
| P1 | Workflow designer cannot connect nodes | Frontend + backend |
| P1 | Rollback does not reopen correction work or retain structured reasons | Frontend + backend |
| P1 | Jump changes one ticket's step instead of advancing the workflow graph | Frontend + backend |
| P1 | Project analytics calls an unregistered API and displays fallback zeros | Frontend/backend contract |
| P1 | Flagging no longer escalates blockers to a selected manager | Frontend + backend |
| P1 | Manually created review tasks lose their review behavior | Backend |
| P1 | Task creation omits the legacy cross-team assignment restriction | Backend |
| P2 | An assigned task cannot be unassigned | Frontend + backend |
| P2 | Completing the final task no longer closes the subject and notifies the owner | Backend |
| P2 | Workflow administration lacks restore, duplication, type management, and reordering | Frontend + backend |
| P2 | Date-range reports and the advanced-report entry point are missing | Frontend + backend/integration |

## 1. Workflow connections cannot be configured — P1

**Old behavior:** A node accepts predecessor IDs and updates graph relationships. This supports branches and dependencies, not just an ordered display.

**Current behavior:** The frontend node payload contains only name, schema, start/end flags, and ID. Backend create/update commands also omit predecessor/successor IDs. Application code reads NodeSequences during task progression, but the workflow administration module has no corresponding write operation. Legacy migration imports existing connections, explaining why migrated workflows can behave differently from newly authored ones.

**Business impact:** Create two nodes with steps, finish the first node, and the second has no configured dependency edge to trigger it. A displayed node order does not substitute for a connection.

Evidence: [legacy node editing](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Controllers/NodeController.cs:110), [new node form contract](D:/Full-Stack/frontend_refactor/src/app/modules/workflows-module/features/schema-list-screen/domain/entity/schema-list.entity.ts:53), [new node creation](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Workflows/TaskManagementSystem.Modules.Workflows/Features/Nodes/CreateNode/CreateNodeCommandHandler.cs:23), [progression reads connections](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Infrastructure/Persistence/Queries/WorkflowStepLookupQueries.cs:268).

Acceptance: create a branching workflow entirely through the UI, reload it, and prove that successor tasks open only when their predecessor conditions are satisfied.

## 2. Review rollback stops at a status change — P1

**Old behavior:** The reviewer selects a previous step, supplies clarification and issue notes, and the system reactivates or creates the correction task. It stores source/target relationships and rollback history.

**Current behavior:** The UI sends only a ticket ID. The handler changes the review ticket to Rollback, closes its timer, and records a generic activity. It does not create/reactivate the earlier task, accept issue notes, or expose equivalent structured rollback history.

**Business impact:** A review can be rejected without generating actionable correction work. The review ticket then has no normal Proceed transition out of Rollback.

Evidence: [legacy rollback and correction creation](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Services/Task/TaskService.cs:1150), [legacy structured history](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Services/Rollback/RollbackService.cs:101), [current rollback handler](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Features/Tickets/RollbackTicket/RollbackTicketCommandHandler.cs:26), [UI rollback](D:/Full-Stack/frontend_refactor/src/app/modules/tasks-module/features/task-board-screen/presentation/task-drawer.component.ts:337).

Acceptance: reject a review back to a chosen earlier step, verify correction ownership and issue notes, complete the correction, and return to review with an intact history.

## 3. Jump no longer performs the legacy workflow operation — P1

**Old behavior:** Jump accepts multiple node/step destinations, traverses predecessors, marks bypassed work done, and creates or reactivates destination tasks using each destination's task-bank metadata.

**Current behavior:** Jump accepts one step ID and changes the existing ticket's StepId and status. Its name, team, assignee, review flag, and duration remain attached to the original task. It does not reconcile intervening tickets or open multiple branches.

**Business impact:** Jumping from writing to review can leave a writing ticket, assigned to the writing team, represented as being at a review step; downstream dependencies and completion totals can disagree.

Evidence: [legacy graph jump](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Services/Task/TaskService.cs:2985), [new jump handler](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Features/Tickets/JumpTicket/JumpTicketCommandHandler.cs:61), [domain mutation](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Domain/Ticket.cs:382), [single-destination UI](D:/Full-Stack/frontend_refactor/src/app/modules/tasks-module/features/task-board-screen/presentation/task-drawer.component.ts:388).

Acceptance: jump across a branch boundary, verify all bypassed work, destination metadata, assignments, timers, and subsequent completion behavior.

## 4. Project analytics has a missing backend endpoint — P1

**Current mismatch:** The frontend calls `/analytics/projects/{id}/overview`. The backend analytics route registration exposes only subject and sprint overviews. The frontend catches failed project overview requests and replaces them with empty statistics.

**Business impact:** Against this API, populated projects can appear to have zero learning objectives and zero progress instead of reporting a load failure. This affects project overview and callers that reuse project overview statistics.

Evidence: [frontend URL](D:/Full-Stack/frontend_refactor/src/app/core/network/api/api.const.ts:90), [request and zero fallback](D:/Full-Stack/frontend_refactor/src/app/core/network/analytics-overview.service.ts:84), [backend registered routes](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Api/TaskManagementSystem.Api/Endpoints/Analytics/AnalyticsEndpoints.cs:9), [project report consumption](D:/Full-Stack/frontend_refactor/src/app/modules/reports-module/features/project-overview-screen/presentation/project-overview.component.ts:49).

Acceptance: use a project with subjects and known nonzero totals; the real API must return correct aggregated values. A failed request must display an error, not fabricated zero totals. Merely replacing project IDs with subject IDs is not a valid fix.

## 5. Flagging loses blocker escalation — P1

**Old behavior:** Flagging requires a selected team leader/section head and a comment, records those details, and sends that recipient a notification.

**Current behavior:** The flag action only toggles the flag, stops work when necessary, writes generic activity, and publishes a ticket update. Its command/UI do not collect a recipient or explanation; the handler does not trigger the legacy targeted escalation.

**Business impact:** Work is blocked without telling the responsible manager why or requesting their intervention. A general realtime ticket refresh is not equivalent to an inbox notification.

Evidence: [legacy recipient/comment validation and notification](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Services/Task/TaskService.cs:1391), [new flag handler](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Features/Tickets/FlagTicket/FlagTicketCommandHandler.cs:26), [UI action](D:/Full-Stack/frontend_refactor/src/app/modules/tasks-module/features/task-board-screen/presentation/task-drawer.component.ts:315).

Acceptance: flag with a reason and recipient; verify the recipient's persisted notification and the reason in task history.

## 6. Manual task creation loses review metadata — P1

**Old behavior:** Creation sets IsReview from the task-bank type and puts team-leader-only tasks directly into ToDo.

**Current behavior:** Ticket.Create sets IsReview=false and Status=Backlog. CreateTicketCommandHandler passes team-leader-only metadata but never applies the bank's review type or the successor preparation logic. Automatic successor creation does apply this metadata, so the two creation paths differ.

**Business impact:** A manually created review task cannot pass the rollback guard, which requires IsReview=true. Team-leader-only tasks also start in the wrong legacy column.

Evidence: [legacy creation](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Services/Task/TaskService.cs:1623), [current defaults](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Domain/Ticket.cs:69), [manual creation handler](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Features/Tickets/CreateTicket/CreateTicketCommandHandler.cs:65), [rollback guard](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Domain/Ticket.cs:275).

Acceptance: manually create a review task and a team-leader-only task; confirm correct review actions and initial status.

## 7. Create-task assignment bypasses a business restriction — P1

**Old behavior:** Outside Owner/Project Manager roles, an assignee must belong to the task-bank item's group.

**Current behavior:** Creation verifies that the user and bank team exist, but does not compare the assignee's team or receive the actor role. The separate assignment handler does enforce the team restriction.

**Business impact:** A caller with Tickets.Create can assign cross-team work through creation even though the normal reassignment operation rejects the same combination. Endpoint permission is present; the missing part is the business-level assignee restriction.

Evidence: [legacy create restriction](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Services/Task/TaskService.cs:244), [new creation user check](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Features/Tickets/CreateTicket/CreateTicketCommandHandler.cs:44), [creation request construction](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Api/TaskManagementSystem.Api/Endpoints/Ticket/Tickets/CreateTicketEndpoint.cs:25), [restriction retained in reassignment](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Features/Tickets/AssignTicket/AssignTicketCommandHandler.cs:39).

Acceptance: a non-Owner/non-Project-Manager with create permission must receive a rejection for a cross-team assignee; authorized exception roles must retain their behavior.

## 8. Task unassignment is missing — P2

**Old behavior:** Assigning user ID 0 clears the assignee and returns the task to Backlog or ToDo according to its team-leader-only rule.

**Current behavior:** The assign validator requires UserId > 0; the handler always resolves an active user; the UI requires a selected user. No alternative unassignment endpoint was found.

**Business impact:** Managers can replace an assignee but cannot return the work to the available queue.

Evidence: [legacy unassignment](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Services/Task/TaskService.cs:163), [new validation](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Features/Tickets/AssignTicket/AssignTicketCommandValidator.cs:10), [current UI assignment](D:/Full-Stack/frontend_refactor/src/app/modules/tasks-module/features/task-board-screen/presentation/task-drawer.component.ts:298).

Acceptance: unassign a task, verify the assignee is cleared, the appropriate queue/status is restored, and any running timer is handled consistently.

## 9. Final completion no longer closes the subject — P2

**Old behavior:** After completion and successor creation, the system checks remaining work, marks the associated subject Closed, and notifies the owner. The legacy method calls this a project, but it updates the Subjects entity.

**Current behavior:** Completion opens successor tickets and emits a ticket-completed event. The notification consumer informs the assignee about that ticket; no equivalent subject-closing consumer or remaining-work check was found.

**Business impact:** Finished subjects can stay Active and owners lose the completion notification.

Evidence: [legacy automatic closure](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Services/Task/TaskService.cs:2318), [current completion handler](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Ticket/TaskManagementSystem.Modules.Ticket/Features/Tickets/CompleteTicket/CompleteTicketCommandHandler.cs:38), [current completion notification](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Notifications/TaskManagementSystem.Modules.Notifications/Features/Integration/OnTicketCompletedIntegrationEvent.cs:33).

Acceptance: complete the final remaining task after successors have been evaluated; verify subject status and owner notification. Do not close while another branch still has work.

## 10. Workflow administration is incomplete — P2

The legacy app has schema duplication, archived schema listing/restoration, schema-type create/edit/delete, and node ordering operations. The current schema API registers list/get/create/update/archive plus node operations; type support is list-only. Node/step update contracts cannot change order. The current frontend exposes the corresponding smaller set.

**Business impact:** Users cannot restore an accidentally archived schema, clone a proven workflow, maintain type classifications, or rearrange authored workflow stages through the app.

Evidence: [legacy schema operations](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Controllers/SchemaController.cs:203), [legacy node ordering](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Controllers/NodeController.cs:452), [current schema routes](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Api/TaskManagementSystem.Api/Endpoints/Workflows/Schemas/WorkflowSchemaEndpoints.cs:9), [current type registration](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Api/TaskManagementSystem.Api/Endpoints/Workflows/WorkflowsEndpoints.cs:15), [node update contract](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Workflows/TaskManagementSystem.Modules.Workflows/Features/Nodes/UpdateNode/UpdateNodeCommand.cs:7), [step update contract](D:/Full-Stack/TaskManagementSystem_Refactor/TaskManagementSystem/src/Modules/Workflows/TaskManagementSystem.Modules.Workflows/Features/Steps/UpdateStep/UpdateStepCommand.cs:7).

Acceptance: clone and restore a schema, manage its type, and reorder stages without database edits; copied graph links must remain internally consistent.

## 11. Reporting coverage is reduced — P2

**Old behavior:** Project reports accept a start/end date range and the UI provides date pickers. An Advanced Report page opens the external SSRS navigation/report integration.

**Current behavior:** The project overview is a current snapshot with no reporting interval. The API has only the two overview endpoints above, with no equivalent date-range report operation. No Advanced Report route/integration was found.

**Business impact:** Managers cannot reproduce the old period-based reports or access the advanced reporting entry point from the new app.

Evidence: [legacy report API](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem/Controllers/ReportController.cs:24), [legacy date filter UI](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem.UI/client/src/pages/project-overview/index.tsx:56), [legacy advanced report](D:/Full-Stack/TaskManagementSystem_Ver1.0/AutomatedTaskSystem.UI/client/src/pages/advancedReport/index.tsx:5), [new report routes](D:/Full-Stack/frontend_refactor/src/app/modules/reports-module/reports.routes.ts:6).

Acceptance: reconcile a known historical date range against the old report. Confirm whether the external reporting service is still a required product integration; its availability was not tested.

## Existing coverage and limits

Routes and implementations are present for curriculum hierarchy and subject assignments/status; task board/sheet/list and basic task actions; sprint management and archive/restore; leave, permission, work-from-home and forgot-clock requests; medical uploads; bulk approval opinions; balances and holidays; users/roles/teams/sections; notifications; and basic summaries/analytics. Their presence is not a claim that every rule has passed acceptance testing.

The review concentrated on business parity and source contracts. It did not run servers, migrate or seed databases, mutate business records, run end-to-end tests, or verify visual appearance. No build/test success is claimed. Existing mocks can demonstrate UI behavior without proving these backend business rules.

Recommended implementation order: restore workflow links and rollback/jump semantics; correct creation metadata and assignment checks; repair the analytics contract and error display; then restore blocker escalation, closure/unassignment, administration and reports. Use the acceptance scenarios above as the business regression checklist.

