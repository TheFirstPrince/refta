import { Module } from '@nestjs/common';
import { SlotsModule } from '../slots/slots.module';
import { ExportController } from './export.controller';

@Module({ imports: [SlotsModule], controllers: [ExportController] })
export class ExportModule {}
