import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {StatisticsService} from "../statistics.service";
import {CardModule} from "primeng/card";
import {ChartModule} from "primeng/chart";
import {NgIf} from "@angular/common";
import {FocusTrapModule} from "primeng/focustrap";

@Component({
  selector: 'app-home',
  imports: [
    CardModule,
    ChartModule,
    NgIf,
    FocusTrapModule
  ],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  // Data for charts
  assignmentStatusData: any;
  assignmentStatusOptions: any;

  avgNotePerStudentData: any;
  avgNotePerStudentOptions: any;

  assignmentsPerProfData: any;
  assignmentsPerProfOptions: any;

  assignmentDateScatterData: any;
  assignmentDateScatterOptions: any;

  assignmentsPerMatiereData: any;
  assignmentsPerMatiereOptions: any;

  isLoadingStatus: boolean = true;
  isLoadingAvgNotes: boolean = true;
  isLoadingAssignmentsPerProf: boolean = true;
  isLoadingDateScatter: boolean = true;
  isLoadingAssignmentsPerMatiere: boolean = true;

  assignmentTrendData: any;
  assignmentTrendOptions: any;

  noteDistributionData: any;
  noteDistributionOptions: any;

  profStatusBreakdownData: any;
  profStatusBreakdownOptions: any;

  isLoadingTrend: boolean = true;
  isLoadingNotesDist: boolean = true;
  isLoadingProfBreakdown: boolean = true;

  avgNotesTrendData: any;
  avgNotesTrendOptions: any;
  isLoadingAvgNotesTrend: boolean = true;

  constructor(private statsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadAssignmentStatusCounts();
    this.loadAverageNotePerStudent();
    this.loadAssignmentsPerProfessor();
    this.loadAssignmentsByDate();
    this.loadAssignmentsPerMatiere();
    this.loadAssignmentTrend();
    this.loadNoteDistribution();
    this.loadProfessorStatusBreakdown();
    this.loadAverageNotesTrend();

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        },
        y: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' },
          beginAtZero: true
        }
      }
    };
    const pieDonutOptions = { plugins: { legend: { position: 'top', labels: { color: '#495057'}}}, responsive: true, maintainAspectRatio:false };

    this.assignmentStatusOptions = {...commonOptions, plugins: { legend: { position: 'top' } }};
    this.avgNotePerStudentOptions = {...commonOptions, indexAxis: 'y' }; // Horizontal bar chart
    this.assignmentsPerProfOptions = {...commonOptions };
    this.assignmentDateScatterOptions = {
      ...commonOptions,
      scales: {
        x: { ...commonOptions.scales.x, type: 'time', time: { unit: 'day', tooltipFormat: 'DD MMM YYYY' }, title: { display: true, text: 'Date de Rendu'} },
        y: { ...commonOptions.scales.y, title: { display: true, text: 'Note'} }
      },
      plugins: { tooltip: { callbacks: { label: (context: any) => `${context.raw.assignmentName}: Note ${context.parsed.y}` }}}
    };
    this.assignmentsPerMatiereOptions = {...commonOptions, plugins: { legend: { position: 'top' } }};
    this.assignmentTrendOptions = {
      ...commonOptions,
      plugins: { legend: { display: false }, title: { display: true, text: 'Assignments Rendus par Mois' } },
      scales: { x: { ...commonOptions.scales.x, title: { display: true, text: 'Mois'}}, y: { ...commonOptions.scales.y, title: { display: true, text: 'Nombre d\'Assignments'}}}
    };
    this.noteDistributionOptions = {
      ...commonOptions,
      plugins: { legend: { display: false }, title: { display: true, text: 'Distribution des Notes' } },
      scales: { x: { ...commonOptions.scales.x, title: { display: true, text: 'Tranche de Notes'}}, y: { ...commonOptions.scales.y, title: { display: true, text: 'Nombre d\'Assignments'}}}
    };
    this.profStatusBreakdownOptions = {
      ...commonOptions,
      plugins: { title: { display: true, text: 'Statuts des Assignments par Professeur' }, legend: { position: 'top' } },
      scales: { x: { ...commonOptions.scales.x, stacked: true, title: { display: true, text: 'Professeur'} }, y: { ...commonOptions.scales.y, stacked: true, title: { display: true, text: 'Nombre d\'Assignments'}}}
    };
    this.assignmentStatusOptions = pieDonutOptions;
    this.assignmentsPerMatiereOptions = pieDonutOptions;
    this.avgNotesTrendOptions = {
      ...commonOptions,
      plugins: {
        legend: { display: true, position: 'top' },
        title: { display: true, text: 'Tendance des Notes Moyennes par Mois de Rendu' },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(2);
              }
              const pointData = context.dataset.originalData[context.dataIndex];
              if (pointData && pointData.assignmentCount) {
                label += ` (${pointData.assignmentCount} assignments)`;
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: { ...commonOptions.scales.x, title: { display: true, text: 'Mois de Rendu'} },
        y: { ...commonOptions.scales.y, title: { display: true, text: 'Note Moyenne'}, min:0, max: 20 }
      }
    };
  }

  loadAssignmentStatusCounts(): void {
    this.isLoadingStatus = true;
    this.subscriptions.add(
      this.statsService.getAssignmentStatusCounts().subscribe(data => {
        const labels = Object.keys(data);
        const values = Object.values(data);
        this.assignmentStatusData = {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
          }]
        };
        this.isLoadingStatus = false;
      }, () => this.isLoadingStatus = false)
    );
  }

  loadAverageNotePerStudent(): void {
    this.isLoadingAvgNotes = true;
    this.subscriptions.add(
      this.statsService.getAverageNotePerStudent().subscribe(data => {
        this.avgNotePerStudentData = {
          labels: data.map(s => `${s.studentPrenom} ${s.studentNom}`),
          datasets: [{
            label: 'Moyenne des Notes',
            backgroundColor: '#42A5F5',
            borderColor: '#1E88E5',
            data: data.map(s => s.averageNote)
          }]
        };
        this.isLoadingAvgNotes = false;
      }, () => this.isLoadingAvgNotes = false)
    );
  }

  loadAssignmentsPerProfessor(): void {
    this.isLoadingAssignmentsPerProf = true;
    this.subscriptions.add(
      this.statsService.getAssignmentsPerProfessor().subscribe(data => {
        this.assignmentsPerProfData = {
          labels: data.map(p => `${p.professorPrenom} ${p.professorNom}`),
          datasets: [{
            label: 'Nombre d\'Assignments Gérés',
            backgroundColor: '#9CCC65',
            borderColor: '#7CB342',
            data: data.map(p => p.assignmentCount)
          }]
        };
        this.isLoadingAssignmentsPerProf = false;
      }, () => this.isLoadingAssignmentsPerProf = false)
    );
  }

  loadAssignmentsByDate(): void { // For Scatter
    this.isLoadingDateScatter = true;
    this.subscriptions.add(
      this.statsService.getAssignmentsByDate().subscribe(data => {
        this.assignmentDateScatterData = {
          datasets: [{
            label: 'Assignments (Note / Date de Rendu)',
            data: data.map(a => ({ x: new Date(a.dateDeRendu), y: a.note, assignmentName: a.nom })),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        };
        this.isLoadingDateScatter = false;
      }, () => this.isLoadingDateScatter = false)
    );
  }

  loadAssignmentsPerMatiere(): void {
    this.isLoadingAssignmentsPerMatiere = true;
    this.subscriptions.add(
      this.statsService.getAssignmentsCountPerMatiere().subscribe(data => {
        this.assignmentsPerMatiereData = {
          labels: data.map(m => m.matiere),
          datasets: [{
            data: data.map(m => m.count),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
          }]
        };
        this.isLoadingAssignmentsPerMatiere = false;
      }, () => this.isLoadingAssignmentsPerMatiere = false)
    );
  }

  loadAssignmentTrend(): void {
    this.isLoadingTrend = true;
    this.subscriptions.add(
      this.statsService.getAssignmentTrendByDueDate().subscribe(data => {
        this.assignmentTrendData = {
          labels: data.map(item => item.date), // "YYYY-MM"
          datasets: [{
            label: 'Assignments à Rendre',
            data: data.map(item => item.count),
            fill: true,
            borderColor: '#42A5F5',
            tension: 0.4,
            backgroundColor: 'rgba(66,165,245,0.2)'
          }]
        };
        this.isLoadingTrend = false;
      }, () => this.isLoadingTrend = false)
    );
  }

  loadNoteDistribution(): void {
    this.isLoadingNotesDist = true;
    this.subscriptions.add(
      this.statsService.getNotesDistribution().subscribe(data => {
        this.noteDistributionData = {
          labels: data.map(item => item.range),
          datasets: [{
            label: 'Nombre d\'Assignments',
            data: data.map(item => item.count),
            backgroundColor: '#FFA726',
            borderColor: '#FB8C00'
          }]
        };
        this.isLoadingNotesDist = false;
      }, () => this.isLoadingNotesDist = false)
    );
  }



  loadProfessorStatusBreakdown(): void {
    this.isLoadingProfBreakdown = true;
    this.subscriptions.add(
      this.statsService.getProfessorAssignmentStatusBreakdown().subscribe(data => {
        const labels = data.map(p => `${p.professorPrenom} ${p.professorNom}`);

        const statusColors = {
          'en cours': 'rgba(255, 159, 64, 0.7)',
          'terminé': 'rgba(75, 192, 192, 0.7)',
          'en attente': 'rgba(255, 205, 86, 0.7)'
        };
        const borderColors = {
          'en cours': 'rgb(255, 159, 64)',
          'terminé': 'rgb(75, 192, 192)',
          'en attente': 'rgb(255, 205, 86)'
        };

        const datasets = ['en cours', 'terminé', 'en attente'].map(statusKey => ({
          label: statusKey.charAt(0).toUpperCase() + statusKey.slice(1),
          data: data.map(p => p.statuses[statusKey as keyof typeof p.statuses] || 0),
          backgroundColor: statusColors[statusKey as keyof typeof statusColors],
          borderColor: borderColors[statusKey as keyof typeof borderColors],
          borderWidth: 1
        }));

        this.profStatusBreakdownData = { labels, datasets };
        this.isLoadingProfBreakdown = false;
      }, () => this.isLoadingProfBreakdown = false)
    );
  }

  loadAverageNotesTrend(): void {
    this.isLoadingAvgNotesTrend = true;
    this.subscriptions.add(
      this.statsService.getAverageNotesTrendByDueDate().subscribe(data => {
        this.avgNotesTrendData = {
          labels: data.map(item => item.date),
          datasets: [{
            label: 'Note Moyenne',
            data: data.map(item => item.averageNote),
            originalData: data,
            fill: false,
            borderColor: '#FF6384',
            tension: 0.1
          }]
        };
        this.isLoadingAvgNotesTrend = false;
      }, () => {
        this.isLoadingAvgNotesTrend = false;
      })
    );
  }



  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
