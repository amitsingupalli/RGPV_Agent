import React, { useState } from 'react';
import { 
  initialStudentProfile, 
  curriculumUnits, 
  pyqQuestions, 
  initialScheduleDays, 
  traceNodes 
} from './data/mockData';
import { 
  StudentProfile, 
  Unit, 
  PYQQuestion, 
  DaySchedule, 
  StudySession, 
  Topic, 
  Language 
} from './types';
import { Navbar } from './components/Navbar';
import { DocumentIngestionHub } from './components/DocumentIngestionHub';
import { SyllabusExplorer } from './components/SyllabusExplorer';
import { StudyTimetable } from './components/StudyTimetable';
import { ActiveStudyRoom } from './components/ActiveStudyRoom';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TopicExplainerDrawer } from './components/TopicExplainerDrawer';
import { PdfCitationModal } from './components/PdfCitationModal';
import { TracingModal } from './components/TracingModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [profile, setProfile] = useState<StudentProfile>(initialStudentProfile);
  const [units, setUnits] = useState<Unit[]>(curriculumUnits);
  const [pyqs, setPyqs] = useState<PYQQuestion[]>(pyqQuestions);
  const [scheduleDays, setScheduleDays] = useState<DaySchedule[]>(initialScheduleDays);
  
  // Active topic for Study Room
  const [selectedTopicId, setSelectedTopicId] = useState<string>('topic-3-1');

  // Modal / Drawer states
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);
  const [priorityExplainerData, setPriorityExplainerData] = useState<{
    day: DaySchedule | null;
    topic: Topic | null;
  } | null>(null);
  const [isTracesOpen, setIsTracesOpen] = useState<boolean>(false);

  // All topics flat array
  const allTopics = units.flatMap((u) => u.topics);
  const currentTopic = allTopics.find((t) => t.id === selectedTopicId) || allTopics[0];

  // Handler to update student profile
  const handleUpdateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  // Language toggle
  const handleLanguageChange = (lang: Language) => {
    setProfile((prev) => ({ ...prev, language: lang }));
  };

  // Reassign PYQ question to another topic (Human in the Loop)
  const handleReassignQuestion = (questionId: string, newTopicId: string) => {
    setPyqs((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, topicId: newTopicId } : q))
    );

    // Update mappedPYQIds on the topics
    setUnits((prevUnits) =>
      prevUnits.map((u) => ({
        ...u,
        topics: u.topics.map((t) => {
          if (t.id === newTopicId && !t.mappedPYQIds.includes(questionId)) {
            return {
              ...t,
              mappedPYQIds: [...t.mappedPYQIds, questionId],
              appearancesCount: t.appearancesCount + 1,
            };
          }
          if (t.mappedPYQIds.includes(questionId) && t.id !== newTopicId) {
            return {
              ...t,
              mappedPYQIds: t.mappedPYQIds.filter((id) => id !== questionId),
              appearancesCount: Math.max(0, t.appearancesCount - 1),
            };
          }
          return t;
        }),
      }))
    );
  };

  // Update topic mastery
  const handleUpdateTopicMastery = (topicId: string, newMastery: number) => {
    setUnits((prevUnits) =>
      prevUnits.map((u) => ({
        ...u,
        topics: u.topics.map((t) =>
          t.id === topicId ? { ...t, masteryPercentage: newMastery } : t
        ),
      }))
    );
  };

  // Toggle study session completed
  const handleToggleSessionComplete = (dayNumber: number, sessionId: string) => {
    setScheduleDays((prevDays) =>
      prevDays.map((d) => {
        if (d.dayNumber === dayNumber) {
          return {
            ...d,
            sessions: d.sessions.map((s) =>
              s.id === sessionId ? { ...s, completed: !s.completed } : s
            ),
          };
        }
        return d;
      })
    );
  };

  // Approve study timetable
  const handleApprovePlan = () => {
    setProfile((prev) => ({
      ...prev,
      planApproved: true,
      hitlInterruptActive: false,
      hitlInterruptReason: undefined,
    }));
  };

  // Adjust schedule constraints
  const handleAdjustConstraints = (newCap: number, newTarget: number) => {
    setProfile((prev) => ({
      ...prev,
      dailyHoursCap: newCap,
      targetScore: newTarget,
      planApproved: false,
      hitlInterruptActive: true,
      hitlInterruptReason: 'Constraints Adjusted — Review Updated Schedule Prioritization',
    }));

    // Re-scale schedule days slightly to honor the cap
    setScheduleDays((prev) =>
      prev.map((d) => {
        if (d.isBufferDay) return d;
        const targetMinutes = Math.min(Math.round(newCap * 60), 240);
        return {
          ...d,
          totalMinutes: targetMinutes,
          sessions: d.sessions.map((s, idx) => ({
            ...s,
            durationMinutes: idx === 0 ? Math.round(targetMinutes * 0.35) : Math.round(targetMinutes * 0.22),
          })),
        };
      })
    );
  };

  // Trigger HITL appeal
  const handleTriggerHitlAppeal = (reason: string) => {
    setProfile((prev) => ({
      ...prev,
      hitlInterruptActive: true,
      hitlInterruptReason: reason,
    }));
  };

  // Open study room for specific topic
  const handleSelectTopicForStudy = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentTab('studyroom');
  };

  // Open citation modal
  const handleOpenCitation = (cite: any) => {
    if (typeof cite === 'string') {
      // Find from citations or generate excerpt
      setSelectedCitation({
        id: 'cite-ref',
        docName: cite.split(',')[0] || 'Official RGPV Document',
        page: parseInt(cite.match(/\d+/)?.[0] || '1', 10),
        excerpt: 'Official question formulated as part of Rajiv Gandhi Proudyogiki Vishwavidyalaya CS-403 university examinations.',
        context: cite,
      });
    } else {
      setSelectedCitation(cite);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        language={profile.language}
        onLanguageChange={handleLanguageChange}
        profile={profile}
        onOpenTraces={() => setIsTracesOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {currentTab === 'dashboard' && (
          <AnalyticsDashboard
            units={units}
            profile={profile}
            traceNodes={traceNodes}
            onSelectTopicForStudy={handleSelectTopicForStudy}
            onOpenTraces={() => setIsTracesOpen(true)}
            onOpenTimetable={() => setCurrentTab('timetable')}
          />
        )}

        {currentTab === 'ingestion' && (
          <DocumentIngestionHub
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onCompleteIngestion={() => setCurrentTab('syllabus')}
          />
        )}

        {currentTab === 'syllabus' && (
          <SyllabusExplorer
            units={units}
            pyqs={pyqs}
            onReassignQuestion={handleReassignQuestion}
            onSelectTopicForStudy={handleSelectTopicForStudy}
            onOpenCitation={handleOpenCitation}
          />
        )}

        {currentTab === 'timetable' && (
          <StudyTimetable
            scheduleDays={scheduleDays}
            profile={profile}
            allTopics={allTopics}
            onApprovePlan={handleApprovePlan}
            onAdjustConstraints={handleAdjustConstraints}
            onOpenPriorityExplainer={(day, topic) =>
              setPriorityExplainerData({ day, topic })
            }
            onSelectSessionForStudy={(topicId) => handleSelectTopicForStudy(topicId)}
            onToggleSessionComplete={handleToggleSessionComplete}
          />
        )}

        {currentTab === 'studyroom' && (
          <ActiveStudyRoom
            currentTopic={currentTopic}
            allUnits={units}
            language={profile.language}
            onLanguageChange={handleLanguageChange}
            onSelectTopic={(id) => setSelectedTopicId(id)}
            onOpenCitation={handleOpenCitation}
            onUpdateTopicMastery={handleUpdateTopicMastery}
            onTriggerHitlAppeal={handleTriggerHitlAppeal}
          />
        )}
      </main>

      {/* Topic Priority Formula Explainer Drawer */}
      <TopicExplainerDrawer
        daySchedule={priorityExplainerData?.day || null}
        topic={priorityExplainerData?.topic || null}
        onClose={() => setPriorityExplainerData(null)}
      />

      {/* Verifiable PDF Source Citation Modal */}
      <PdfCitationModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      {/* LangGraph Agent Execution Tracing Modal */}
      <TracingModal
        isOpen={isTracesOpen}
        onClose={() => setIsTracesOpen(false)}
        traceNodes={traceNodes}
      />
    </div>
  );
}
