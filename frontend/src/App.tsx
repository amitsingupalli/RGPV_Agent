import React, { useState } from 'react';
import { 
  initialStudentProfile, 
  traceNodes 
} from './data/mockData';
import { getCurriculumForSubject } from './data/subjectCurriculumEngine';
import { 
  StudentProfile, 
  Unit, 
  PYQQuestion, 
  DaySchedule, 
  StudySession, 
  Topic, 
  Language,
  UploadedDocumentItem
} from './types';
import { Navbar } from './components/Navbar';
import { DocumentIngestionHub } from './components/DocumentIngestionHub';
import { SyllabusExplorer } from './components/SyllabusExplorer';
import { StudyTimetable } from './components/StudyTimetable';
import { TopicLearningView } from './components/TopicLearningView';
import { ActiveStudyRoom } from './components/ActiveStudyRoom';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TopicExplainerDrawer } from './components/TopicExplainerDrawer';
import { PdfCitationModal } from './components/PdfCitationModal';
import { TracingModal } from './components/TracingModal';

/**
 * Dynamically build a day-by-day study schedule from user-entered parameters:
 * - totalDays (from user's exam date / daysRemaining)
 * - dailyHoursCap (user's daily study hour ceiling)
 * - bufferDays (user's chosen number of revision buffer days)
 * - units (with user's starting mastery level, e.g., 0%)
 */
function generateUserSchedule(
  units: Unit[],
  profile: StudentProfile
): DaySchedule[] {
  const allTopics = units.flatMap((u) => u.topics);
  if (allTopics.length === 0) return [];

  // Rank topics by priority formula: P_i = 0.35*F + 0.20*D + 0.25*S + 0.20*(100 - M)
  const rankedTopics = [...allTopics]
    .map((t) => {
      const masteryDeficit = 100 - t.masteryPercentage;
      const priority = Number(
        (
          0.35 * t.frequencyScore +
          0.20 * t.difficultyScore +
          0.25 * t.syllabusWeight +
          0.20 * masteryDeficit
        ).toFixed(1)
      );
      return { topic: t, priority, masteryDeficit };
    })
    .sort((a, b) => b.priority - a.priority);

  const totalDays = Math.max(1, Math.min(60, profile.daysRemaining || 14));
  const bufferCount = Math.min(profile.bufferDays, Math.max(0, totalDays - 1));
  const dailyMinutesCap = Math.round(profile.dailyHoursCap * 60);

  const today = new Date();
  const days: DaySchedule[] = [];

  for (let i = 1; i <= totalDays; i++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() + (i - 1));
    const dateStr = dayDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const isBufferDay = i > totalDays - bufferCount;
    const rankedItem = rankedTopics[(i - 1) % rankedTopics.length];
    const primaryTopic = rankedItem.topic;
    const secondaryTopic = rankedTopics[i % rankedTopics.length].topic;

    if (isBufferDay) {
      const bufferMins = Math.min(dailyMinutesCap, 90);
      days.push({
        dayNumber: i,
        date: `Day ${i} • ${dateStr}`,
        totalMinutes: bufferMins,
        isBufferDay: true,
        priorityMetrics: {
          frequency: 0,
          difficulty: 0,
          syllabusWeight: 0,
          masteryDeficit: 0,
          calculatedPriority: 0,
          justification: [
            `Reserved as a revision buffer day based on your preference (${bufferCount} buffer ${bufferCount === 1 ? 'day' : 'days'} selected).`,
            'Use this day for catching up on unfinished topics or light formula review.',
          ],
        },
        sessions: [
          {
            id: `s-${i}-1`,
            type: 'buffer_rest',
            title: `Revision & Catch-Up Block (${profile.subjectCode || 'Course'})`,
            topicId: primaryTopic.id,
            durationMinutes: Math.round(bufferMins * 0.6),
            completed: false,
          },
          {
            id: `s-${i}-2`,
            type: 'spaced_revision',
            title: `Past Paper Checklist & Weak Topic Review`,
            topicId: secondaryTopic.id,
            durationMinutes: Math.round(bufferMins * 0.4),
            completed: false,
          },
        ],
      });
    } else {
      const conceptMins = Math.round(dailyMinutesCap * 0.45);
      const pyqMins = Math.round(dailyMinutesCap * 0.35);
      const recallMins = Math.max(15, dailyMinutesCap - conceptMins - pyqMins);

      days.push({
        dayNumber: i,
        date: `Day ${i} • ${dateStr}`,
        totalMinutes: conceptMins + pyqMins + recallMins,
        isBufferDay: false,
        priorityMetrics: {
          frequency: primaryTopic.frequencyScore,
          difficulty: primaryTopic.difficultyScore,
          syllabusWeight: primaryTopic.syllabusWeight,
          masteryDeficit: rankedItem.masteryDeficit,
          calculatedPriority: rankedItem.priority,
          justification: [
            `Appeared ${primaryTopic.appearancesCount}× in past papers (${primaryTopic.totalMarksInPast5Years} total marks).`,
            `Current mastery is ${primaryTopic.masteryPercentage}% (deficit: ${rankedItem.masteryDeficit}%).`,
            `Scheduled within your ${profile.dailyHoursCap} hrs/day limit (${profile.preferredStudySlot} slot).`,
          ],
        },
        sessions: [
          {
            id: `s-${i}-1`,
            type: 'concept_learning',
            title: `${primaryTopic.title} — Core Concepts & Notes`,
            topicId: primaryTopic.id,
            durationMinutes: conceptMins,
            completed: false,
          },
          {
            id: `s-${i}-2`,
            type: 'pyq_practice',
            title: `Past Exam Questions Practice: ${primaryTopic.title}`,
            topicId: primaryTopic.id,
            durationMinutes: pyqMins,
            completed: false,
          },
          {
            id: `s-${i}-3`,
            type: 'active_recall',
            title: `Self-Check Quiz: ${secondaryTopic.title}`,
            topicId: secondaryTopic.id,
            durationMinutes: recallMins,
            completed: false,
          },
        ],
      });
    }
  }

  return days;
}

export default function App() {
  // New user starts on 'ingestion' (Step 1: Setup & Documents) with empty curriculum & 0 files
  const [currentTab, setCurrentTab] = useState<string>('ingestion');
  const [profile, setProfile] = useState<StudentProfile>(initialStudentProfile);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocumentItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [pyqs, setPyqs] = useState<PYQQuestion[]>([]);
  const [scheduleDays, setScheduleDays] = useState<DaySchedule[]>([]);

  // Active topic for Learn Topic & Study Room
  const [selectedTopicId, setSelectedTopicId] = useState<string>('topic-1-1');

  // Modal / Drawer states
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);
  const [priorityExplainerData, setPriorityExplainerData] = useState<{
    day: DaySchedule | null;
    topic: Topic | null;
  } | null>(null);
  const [isTracesOpen, setIsTracesOpen] = useState<boolean>(false);

  // All topics flat array
  const allTopics = units.flatMap((u) => u.topics);
  const currentTopic = allTopics.find((t) => t.id === selectedTopicId) || allTopics[0] || null;

  // Update student profile (and if subject changes after setup, dynamically reload curriculum for the new subject!)
  const handleUpdateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      if (
        next.isSetupComplete &&
        next.subjectCode &&
        (updates.subjectCode !== undefined || updates.subjectName !== undefined) &&
        updates.subjectCode !== prev.subjectCode
      ) {
        const { units: subjectUnits, pyqs: subjectPyqs } = getCurriculumForSubject(
          next.subjectCode,
          next.subjectName
        );
        const baseline =
          next.startingLevel === 'zero' ? 0 : next.startingLevel === 'basics' ? 25 : 0;
        const initialized = subjectUnits.map((u) => ({
          ...u,
          topics: u.topics.map((t) => ({ ...t, masteryPercentage: baseline })),
        }));
        setUnits(initialized);
        setPyqs(subjectPyqs);
        setScheduleDays(generateUserSchedule(initialized, next));
        if (initialized[0]?.topics[0]) {
          setSelectedTopicId(initialized[0].topics[0].id);
        }
      }
      return next;
    });
  };

  // Language toggle
  const handleLanguageChange = (lang: Language) => {
    setProfile((prev) => ({ ...prev, language: lang }));
  };

  // Complete initial setup from DocumentIngestionHub immediately (< 1 sec)
  const handleCompleteIngestion = (
    customUnitMastery?: Record<string, number>
  ) => {
    const { units: subjectUnits, pyqs: subjectPyqs } = getCurriculumForSubject(
      profile.subjectCode,
      profile.subjectName
    );

    // Initialize units with user's chosen starting level (default 0% when starting from 0)
    const initializedUnits: Unit[] = subjectUnits.map((unit) => {
      const unitBaseline =
        profile.startingLevel === 'zero'
          ? 0
          : profile.startingLevel === 'basics'
          ? 25
          : customUnitMastery?.[unit.id] ?? 0;

      return {
        ...unit,
        topics: unit.topics.map((topic) => ({
          ...topic,
          masteryPercentage: unitBaseline,
        })),
      };
    });

    const updatedProfile: StudentProfile = {
      ...profile,
      isSetupComplete: true,
      planApproved: false,
      hitlInterruptActive: true,
      hitlInterruptReason: `Review your extracted ${profile.subjectCode} (${profile.subjectName}) syllabus topics and approve your study schedule`,
    };

    const generatedDays = generateUserSchedule(initializedUnits, updatedProfile);

    setUnits(initializedUnits);
    setPyqs(subjectPyqs);
    setProfile(updatedProfile);
    setScheduleDays(generatedDays);
    if (initializedUnits[0]?.topics[0]) {
      setSelectedTopicId(initializedUnits[0].topics[0].id);
    }
    setCurrentTab('syllabus');
  };

  // Reset entire app to 0 (New User State)
  const handleResetToZero = () => {
    setProfile(initialStudentProfile);
    setUploadedFiles([]);
    setUnits([]);
    setPyqs([]);
    setScheduleDays([]);
    setCurrentTab('ingestion');
  };

  // Reassign PYQ question to another topic
  const handleReassignQuestion = (questionId: string, newTopicId: string) => {
    setPyqs((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, topicId: newTopicId } : q))
    );

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
    setUnits((prevUnits) => {
      const nextUnits = prevUnits.map((u) => ({
        ...u,
        topics: u.topics.map((t) =>
          t.id === topicId ? { ...t, masteryPercentage: newMastery } : t
        ),
      }));
      return nextUnits;
    });
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
  const handleAdjustConstraints = (
    newCap: number,
    newTarget: number,
    newDaysRemaining?: number,
    newBufferDays?: number
  ) => {
    const nextProfile: StudentProfile = {
      ...profile,
      dailyHoursCap: newCap,
      targetScore: newTarget,
      daysRemaining: newDaysRemaining ?? profile.daysRemaining,
      bufferDays: newBufferDays ?? profile.bufferDays,
      planApproved: false,
      hitlInterruptActive: true,
      hitlInterruptReason: 'Schedule updated with your new study hours and exam constraints — please review',
    };
    setProfile(nextProfile);
    setScheduleDays(generateUserSchedule(units, nextProfile));
  };

  // Trigger review flag
  const handleTriggerHitlAppeal = (reason: string) => {
    setProfile((prev) => ({
      ...prev,
      hitlInterruptActive: true,
      hitlInterruptReason: reason,
    }));
  };

  // Open Learn Topic step for specific topic first before Study Room practice
  const handleSelectTopicForStudy = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentTab('learn');
  };

  // Open citation modal
  const handleOpenCitation = (cite: any) => {
    if (typeof cite === 'string') {
      setSelectedCitation({
        id: 'cite-ref',
        docName: cite.split(',')[0] || 'Uploaded Course Document',
        page: parseInt(cite.match(/\d+/)?.[0] || '1', 10),
        excerpt: `Source reference from ${profile.subjectCode || 'university'} uploaded question bank / syllabus PDF.`,
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
        onResetToZero={handleResetToZero}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {currentTab === 'dashboard' && (
          <AnalyticsDashboard
            units={units}
            scheduleDays={scheduleDays}
            profile={profile}
            traceNodes={profile.isSetupComplete ? traceNodes : []}
            onSelectTopicForStudy={handleSelectTopicForStudy}
            onOpenTraces={() => setIsTracesOpen(true)}
            onOpenTimetable={() => setCurrentTab('timetable')}
            onGoToSetup={() => setCurrentTab('ingestion')}
          />
        )}

        {currentTab === 'ingestion' && (
          <DocumentIngestionHub
            profile={profile}
            files={uploadedFiles}
            onUpdateFiles={setUploadedFiles}
            onUpdateProfile={handleUpdateProfile}
            onCompleteIngestion={handleCompleteIngestion}
          />
        )}

        {currentTab === 'syllabus' && (
          <SyllabusExplorer
            units={units}
            pyqs={pyqs}
            profile={profile}
            onReassignQuestion={handleReassignQuestion}
            onSelectTopicForStudy={handleSelectTopicForStudy}
            onOpenCitation={handleOpenCitation}
            onUpdateTopicMastery={handleUpdateTopicMastery}
            onGoToSetup={() => setCurrentTab('ingestion')}
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
            onGoToSetup={() => setCurrentTab('ingestion')}
          />
        )}

        {currentTab === 'learn' && (
          <TopicLearningView
            currentTopic={currentTopic}
            allUnits={units}
            subjectCode={profile.subjectCode}
            subjectName={profile.subjectName}
            language={profile.language}
            onLanguageChange={handleLanguageChange}
            onSelectTopic={(id) => setSelectedTopicId(id)}
            onOpenCitation={handleOpenCitation}
            onProceedToPractice={() => setCurrentTab('studyroom')}
            onGoToSetup={() => setCurrentTab('ingestion')}
          />
        )}

        {currentTab === 'studyroom' && (
          <ActiveStudyRoom
            currentTopic={currentTopic}
            allUnits={units}
            subjectCode={profile.subjectCode}
            subjectName={profile.subjectName}
            language={profile.language}
            onLanguageChange={handleLanguageChange}
            onSelectTopic={(id) => setSelectedTopicId(id)}
            onOpenCitation={handleOpenCitation}
            onUpdateTopicMastery={handleUpdateTopicMastery}
            onTriggerHitlAppeal={handleTriggerHitlAppeal}
            onGoToSetup={() => setCurrentTab('ingestion')}
          />
        )}
      </main>

      {/* Topic Priority Formula Explainer Drawer */}
      <TopicExplainerDrawer
        daySchedule={priorityExplainerData?.day || null}
        topic={priorityExplainerData?.topic || null}
        onClose={() => setPriorityExplainerData(null)}
      />

      {/* PDF Source Citation Modal */}
      <PdfCitationModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      {/* System Execution Logs Modal */}
      <TracingModal
        isOpen={isTracesOpen}
        onClose={() => setIsTracesOpen(false)}
        traceNodes={profile.isSetupComplete ? traceNodes : []}
      />
    </div>
  );
}
