import {Component, OnInit} from '@angular/core';
import {OrganizationTreeNode, StatisticsService} from "../statistics.service";
import {AuthServiceService, DecodedToken} from "../auth-service.service";
import {environment} from "../../environments/environment";
import {NgClass, NgIf} from "@angular/common";
import {AvatarModule} from "primeng/avatar";
import {OrganizationChartModule} from "primeng/organizationchart";
import {CardModule} from "primeng/card";
import {TreeNode} from "primeng/api";

@Component({
  selector: 'app-organisation',
  imports: [
    NgIf,
    AvatarModule,
    OrganizationChartModule,
    CardModule,
    NgClass
  ],
  standalone: true,
  templateUrl: './organisation.component.html',
  styleUrl: './organisation.component.scss'
})
export class OrganisationComponent implements OnInit {
  chartData: OrganizationTreeNode[] = [];
  isLoading: boolean = true;
  currentUser: DecodedToken | null;
  serverBaseUrl = environment.serverBaseUrl || ''; // Pour les images

  constructor(
    private statsService: StatisticsService, // ou OrganizationService
    private authService: AuthServiceService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadChartData();
  }

  loadChartData(): void {
    this.isLoading = true;
    this.statsService.getMyOrganizationChartData().subscribe({
      next: (data) => {
        this.chartData = this.preprocessChartData(data);
        this.isLoading = false;
        console.log(this.chartData);
      },
      error: (err) => {
        console.error("Erreur chargement données organigramme:", err);
        this.isLoading = false;
        // Afficher un message d'erreur à l'utilisateur
      }
    });
  }

  // S'assurer que les chemins d'images sont corrects et complets
  preprocessChartData(nodes: OrganizationTreeNode[]): OrganizationTreeNode[] {
    const processNode = (node: OrganizationTreeNode) => {
      if (node.type === 'user' && node.data && node.data.image && !node.data.image.startsWith('http')) {
        node.data.image = `${this.serverBaseUrl}${node.data.image}`;
      }
      // @ts-ignore
      console.log(`Image URL pour ${node.data.name}: ${node.data.image}`); // Log pour débogage

      if (node.children) {
        node.children.forEach(processNode);
      }
      return node;
    };
    return nodes.map(rootNode => processNode(rootNode));
  }

  getAvatarLabel(name: string | undefined): string {
    if (name) {
      const parts = name.split(' ');
      const prenomInitial = parts[0] ? parts[0][0].toUpperCase() : '';
      const nomInitial = parts.length > 1 && parts[parts.length -1] ? parts[parts.length -1][0].toUpperCase() : '';
      return prenomInitial + nomInitial;
    }
    return '??';
  }
}
