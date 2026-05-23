import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { parentIdFor, providerIdFor } from "../common/access.helper";
import { ChildrenService } from "../children/children.service";
import { DataStoreService } from "../database/data-store.service";
import { JwtPayload } from "../domain/auth.types";
import { Appointment } from "../domain/types";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly store: DataStoreService,
    private readonly children: ChildrenService,
  ) {}

  list(user: JwtPayload, childId?: string) {
    let list = this.store.appointments;
    if (childId) {
      const child = this.store.findChild(childId);
      if (!child) throw new NotFoundException("Fëmija nuk u gjet.");
      this.children.assertAccess(user, child);
      list = list.filter((a) => a.childId === childId);
    } else {
      list = this.filterByRole(user, list);
    }
    return list
      .map((a) => ({
        ...a,
        childName: this.store.findChild(a.childId)?.fullName,
      }))
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }

  create(user: JwtPayload, dto: CreateAppointmentDto) {
    const child = this.store.findChild(dto.childId);
    if (!child) throw new NotFoundException("Fëmija nuk u gjet.");
    if (user.role === "parent") {
      if (child.parentId !== parentIdFor(user)) {
        throw new ForbiddenException();
      }
    }
    const appt: Appointment = {
      id: this.store.newId("appt"),
      childId: dto.childId,
      providerId: dto.providerId ?? child.pediatricianId,
      service: dto.service,
      date: dto.date,
      time: dto.time,
      healthCenter: dto.healthCenter ?? child.healthCenter,
      status: "pending",
      notes: dto.notes,
    };
    this.store.appointments.push(appt);
    return appt;
  }

  update(user: JwtPayload, id: string, dto: UpdateAppointmentDto) {
    const appt = this.store.appointments.find((a) => a.id === id);
    if (!appt) throw new NotFoundException("Termini nuk u gjet.");
    const child = this.store.findChild(appt.childId);
    if (!child) throw new NotFoundException();
    this.children.assertAccess(user, child);
    if (dto.status) appt.status = dto.status;
    if (dto.date) appt.date = dto.date;
    if (dto.time) appt.time = dto.time;
    if (dto.notes !== undefined) appt.notes = dto.notes;
    return appt;
  }

  private filterByRole(user: JwtPayload, list: Appointment[]) {
    if (user.role === "parent") {
      const pid = parentIdFor(user);
      const ids = this.store.children
        .filter((c) => c.parentId === pid)
        .map((c) => c.id);
      return list.filter((a) => ids.includes(a.childId));
    }
    if (user.role === "pediatrician" || user.role === "nurse") {
      const prov = this.store.findProvider(providerIdFor(user));
      const ids = new Set(prov?.assignedChildren ?? []);
      return list.filter((a) => ids.has(a.childId));
    }
    return list;
  }
}
