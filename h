[1mdiff --git a/src/app/pages/dashboard/pages/equipments/services/equipments.service.ts b/src/app/pages/dashboard/pages/equipments/services/equipments.service.ts[m
[1mindex cc708d18..41dd6642 100644[m
[1m--- a/src/app/pages/dashboard/pages/equipments/services/equipments.service.ts[m
[1m+++ b/src/app/pages/dashboard/pages/equipments/services/equipments.service.ts[m
[36m@@ -48,7 +48,7 @@[m [mexport class EquipmentsService {[m
     this.loading.next(true);[m
     this.error.next(null);[m
     this.success.next(false);[m
[31m-    const url = '${environment.apiUrl}/equipment';[m
[32m+[m[32m    const url = `${environment.apiUrl}/equipment`;[m
     return this.http.get<any[]>(url).pipe([m
       tap((res) => {[m
         this.items.next(res);[m
[36m@@ -69,7 +69,7 @@[m [mexport class EquipmentsService {[m
     this.addLoading.next(true);[m
     this.addError.next(null);[m
     this.addSuccess.next(false);[m
[31m-    const url = '${environment.apiUrl}/equipment';[m
[32m+[m[32m    const url = `${environment.apiUrl}/equipment`;[m
     return this.http.post(url, equipment).pipe([m
       tap(() => {[m
         this.addSuccess.next(true);[m
[36m@@ -90,7 +90,7 @@[m [mexport class EquipmentsService {[m
     this.deleteLoading.next(true);[m
     this.deleteError.next(null);[m
     this.deleteSuccess.next(false);[m
[31m-    const url = '${environment.apiUrl}/equipment/' + equipmentId;[m
[32m+[m[32m    const url = `${environment.apiUrl}/equipment/` + equipmentId;[m
     return this.http.delete(url).pipe([m
       tap(() => {[m
         this.deleteSuccess.next(true);[m
[36m@@ -111,7 +111,7 @@[m [mexport class EquipmentsService {[m
     this.editLoading.next(true);[m
     this.editError.next(null);[m
     this.editSuccess.next(false);[m
[31m-    const url = '${environment.apiUrl}/equipment/' + equipmentId;[m
[32m+[m[32m    const url = `${environment.apiUrl}/equipment/` + equipmentId;[m
     return this.http.put(url, equipment).pipe([m
       tap(() => {[m
         this.editSuccess.next(true);[m
