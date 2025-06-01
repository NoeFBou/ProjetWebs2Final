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
  isAdmin: boolean;

  constructor(
    private statsService: StatisticsService,
    private authService: AuthServiceService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();

  }

  ngOnInit(): void {
    this.loadChartData();
  }

  loadChartData(): void {
    this.isLoading = true;
    this.statsService.getMyOrganizationChartData().subscribe({
      next: (data) => {
        this.chartData = this.processNodesRecursively(data);
        this.isLoading = false;
        console.log("Chart data processed:", this.chartData);
      },
      error: (err) => {
        console.error("Erreur chargement données organigramme:", err);
        this.isLoading = false;
      }
    });
  }

  processNodesRecursively(nodes: OrganizationTreeNode[]): OrganizationTreeNode[] {
    return nodes.map(node => this.addStylingAndProcessImage(node, 0));
  }

  addStylingAndProcessImage(node: OrganizationTreeNode, level: number): OrganizationTreeNode {
    if (node.type === 'user' && node.data && node.data.image && !node.data.image.startsWith('http')) { //
      node.data.image = `${this.serverBaseUrl}${node.data.image}`; //
    }
  //  console.log(`Image URL pour ${node.data?.name}: ${node.data?.image}`);

    let styleClass = `level-${level}-node`;
    if (level >= 3) {
      styleClass = `level-default-node`;
    }
    //node.styleClass = node.styleClass ? `${node.styleClass} ${styleClass}` : styleClass;
   node.styleClass = styleClass;

    if (node.children && node.children.length > 0) {
      node.children = node.children.map(child => this.addStylingAndProcessImage(child, level + 1)); //
    }

    return node;
  }


  getAvatarLabel(name: string | undefined): string {
    console.log("test")
    if (name) {
      const parts = name.split(' ');
      const prenomInitial = parts[0] ? parts[0][0].toUpperCase() : '';
      const nomInitial = parts.length > 1 && parts[parts.length -1] ? parts[parts.length -1][0].toUpperCase() : '';
      return prenomInitial + nomInitial;
    }
    return '??'; //
  }
}
